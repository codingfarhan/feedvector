import { Injectable, HttpException } from "@nestjs/common"
import Razorpay from "razorpay"
import crypto from "crypto"
import { ActiveBillingPlan, isActiveBillingPlan, pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"
import { SubscriptionService } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service"

type RazorpayWebhookEvent = {
  event?: string
  payload?: {
    subscription?: {
      entity?: {
        id?: string
        status?: string
        notes?: Record<string, string>
      }
    }
  }
}

type CreateMonthlySubscriptionOptions = {
  trialDays?: number
}

@Injectable()
export class RazorpayService {
  private readonly keyId = process.env.RAZORPAY_KEY_ID!
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET!
  private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
  private readonly planIds: Record<ActiveBillingPlan, string | undefined> = {
    ESSENTIAL: process.env.RAZORPAY_ESSENTIAL_MONTHLY_PLAN_ID,
    GROWTH: process.env.RAZORPAY_GROWTH_MONTHLY_PLAN_ID,
  }
  private readonly razorpay: Razorpay

  constructor(private readonly _subscriptionService: SubscriptionService) {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay keys are not configured")
    }
    this.razorpay = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    })
  }

  getCheckoutKeyId() {
    return this.keyId
  }

  async createMonthlySubscription(orgId: string, userId: string, billing: ActiveBillingPlan, options: CreateMonthlySubscriptionOptions = {}) {
    const planId = this.planIds[billing]
    if (!planId) {
      throw new HttpException(`Razorpay ${billing} monthly plan ID is not configured`, 500)
    }

    const startAt = options.trialDays ? Math.floor(Date.now() / 1000) + options.trialDays * 24 * 60 * 60 : undefined

    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      ...(startAt ? { start_at: startAt } : {}),
      total_count: 1200,
      quantity: 1,
      customer_notify: true,
      notes: {
        orgId,
        userId,
        billing,
        period: "MONTHLY",
        trial: options.trialDays ? "true" : "false",
      },
    })

    await this._subscriptionService.updateCustomerId(orgId, subscription.id)

    return {
      subscriptionId: subscription.id,
      amount: pricing[billing].month_price,
      currency: "USD",
    }
  }

  verifyCheckoutSignature(paymentId: string, subscriptionId: string, signature: string) {
    const payload = `${paymentId}|${subscriptionId}`
    const expected = crypto.createHmac("sha256", this.keySecret).update(payload).digest("hex")
    return expected === signature
  }

  verifyWebhookSignature(rawBody: string, signature?: string) {
    if (!signature || !this.webhookSecret) {
      return false
    }
    const expected = crypto.createHmac("sha256", this.webhookSecret).update(rawBody).digest("hex")
    return expected === signature
  }

  private async getSubscriptionBilling(subscriptionId: string, fallback?: string): Promise<ActiveBillingPlan> {
    if (fallback && isActiveBillingPlan(fallback)) {
      return fallback
    }

    const subscription = (await this.razorpay.subscriptions.fetch(subscriptionId)) as any
    const billing = subscription?.notes?.billing
    if (!isActiveBillingPlan(billing)) {
      throw new HttpException("Subscription plan is not supported", 400)
    }

    return billing
  }

  async activateSubscription(orgId: string, subscriptionId: string, billing?: string, isTrailing = false) {
    const resolvedBilling = await this.getSubscriptionBilling(subscriptionId, billing)

    return this._subscriptionService.createOrUpdateSubscription(
      isTrailing,
      subscriptionId,
      subscriptionId,
      pricing[resolvedBilling].channel || 0,
      resolvedBilling,
      "MONTHLY",
      null,
      undefined,
      orgId,
    )
  }

  async cancelSubscription(orgId: string, subscriptionId: string) {
    const cancelled = await this.razorpay.subscriptions.cancel(subscriptionId, true)
    const endAtSeconds = cancelled?.current_end || cancelled?.end_at
    const cancelAt = endAtSeconds ? new Date(endAtSeconds * 1000) : null
    await this._subscriptionService.setCancelAt(orgId, cancelAt)
    return { cancelAt }
  }

  async handleWebhook(event: RazorpayWebhookEvent) {
    const eventType = event?.event || ""
    const subscription = event?.payload?.subscription?.entity
    const subscriptionId = subscription?.id
    const orgId = subscription?.notes?.orgId

    if (!subscriptionId) {
      return { ok: true }
    }

    const orgIdResolved =
      orgId ||
      (await this._subscriptionService.getOrganizationIdByPaymentId(subscriptionId)) ||
      (await this._subscriptionService.getOrganizationIdBySubscriptionIdentifier(subscriptionId))

    if (!orgIdResolved) {
      return { ok: true }
    }

    if (eventType === "subscription.activated" || eventType === "subscription.updated") {
      await this.activateSubscription(orgIdResolved, subscriptionId, subscription?.notes?.billing, subscription?.notes?.trial === "true")
      return { ok: true }
    }

    if (eventType === "subscription.charged") {
      await this.activateSubscription(orgIdResolved, subscriptionId, subscription?.notes?.billing, false)
      return { ok: true }
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.completed" || eventType === "subscription.halted") {
      await this._subscriptionService.deleteSubscriptionByOrganizationId(orgIdResolved)
      return { ok: true }
    }

    return { ok: true }
  }
}
