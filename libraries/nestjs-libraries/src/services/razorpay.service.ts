import { Injectable, HttpException } from "@nestjs/common"
import Razorpay from "razorpay"
import crypto from "crypto"
import { pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"
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

@Injectable()
export class RazorpayService {
  private readonly keyId = process.env.RAZORPAY_KEY_ID!
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET!
  private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
  private readonly planId = process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID!
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

  async createProMonthlySubscription(orgId: string, userId: string) {
    if (!this.planId) {
      throw new HttpException("Razorpay plan ID is not configured", 500)
    }

    const subscription = await this.razorpay.subscriptions.create({
      plan_id: this.planId,
      total_count: 1200,
      quantity: 1,
      customer_notify: true,
      notes: {
        orgId,
        userId,
        billing: "PRO",
        period: "MONTHLY",
      },
    })

    await this._subscriptionService.updateCustomerId(orgId, subscription.id)

    return {
      subscriptionId: subscription.id,
      amount: pricing.PRO.month_price,
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

  async activateSubscription(orgId: string, subscriptionId: string) {
    return this._subscriptionService.createOrUpdateSubscription(
      false,
      subscriptionId,
      subscriptionId,
      pricing.PRO.channel || 0,
      "PRO",
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

    if (eventType === "subscription.activated" || eventType === "subscription.charged" || eventType === "subscription.updated") {
      await this.activateSubscription(orgIdResolved, subscriptionId)
      return { ok: true }
    }

    if (eventType === "subscription.cancelled" || eventType === "subscription.completed" || eventType === "subscription.halted") {
      await this._subscriptionService.deleteSubscriptionByOrganizationId(orgIdResolved)
      return { ok: true }
    }

    return { ok: true }
  }
}
