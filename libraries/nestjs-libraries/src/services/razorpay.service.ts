import { Injectable, HttpException } from "@nestjs/common"
import Razorpay from "razorpay"
import crypto from "crypto"
import { ActiveBillingPlan, isActiveBillingPlan, pricing } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/pricing"
import { SubscriptionService } from "@gitroom/nestjs-libraries/database/prisma/subscriptions/subscription.service"
import { NotificationService } from "@gitroom/nestjs-libraries/database/prisma/notifications/notification.service"
import { ioRedis } from "@gitroom/nestjs-libraries/redis/redis.service"

type RazorpayWebhookEvent = {
  id?: string
  event?: string
  created_at?: number
  account_id?: string
  payload?: {
    subscription?: {
      entity?: {
        id?: string
        status?: string
        notes?: Record<string, string>
        current_end?: number
        end_at?: number
      }
    }
    payment?: {
      entity?: Record<string, any>
      downtime?: {
        entity?: Record<string, any>
      }
    }
    dispute?: {
      entity?: Record<string, any>
    }
    downtime?: {
      entity?: Record<string, any>
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

  constructor(private readonly _subscriptionService: SubscriptionService, private readonly _notificationService: NotificationService) {
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
    const fetchedSubscription =
      !cancelled?.current_end && !cancelled?.end_at
        ? ((await this.razorpay.subscriptions.fetch(subscriptionId).catch(() => undefined)) as any)
        : undefined
    const endAtSeconds = cancelled?.current_end || cancelled?.end_at || fetchedSubscription?.current_end || fetchedSubscription?.end_at
    const cancelAt = endAtSeconds ? new Date(endAtSeconds * 1000) : null
    await this._subscriptionService.setCancelAt(orgId, cancelAt)
    return { cancelAt }
  }

  async handleWebhook(event: RazorpayWebhookEvent) {
    const eventType = event?.event || ""
    await this.sendImportantBillingAlert(event).catch((error) => {
      console.error("Failed to send Razorpay billing alert", error)
    })

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

    if (eventType === "subscription.updated" && subscription?.status === "cancelled") {
      const endAtSeconds = subscription?.current_end || subscription?.end_at
      if (endAtSeconds && endAtSeconds * 1000 > Date.now()) {
        await this._subscriptionService.setCancelAt(orgIdResolved, new Date(endAtSeconds * 1000))
      }
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

    if (eventType === "subscription.cancelled") {
      const endAtSeconds = subscription?.current_end || subscription?.end_at
      if (endAtSeconds && endAtSeconds * 1000 > Date.now()) {
        await this._subscriptionService.setCancelAt(orgIdResolved, new Date(endAtSeconds * 1000))
        return { ok: true }
      }

      const existingSubscription = await this._subscriptionService.getSubscriptionByOrganizationId(orgIdResolved)
      if (existingSubscription?.cancelAt && existingSubscription.cancelAt.getTime() > Date.now()) {
        return { ok: true }
      }

      await this._subscriptionService.deleteSubscriptionByOrganizationId(orgIdResolved)
      return { ok: true }
    }

    if (eventType === "subscription.completed" || eventType === "subscription.halted") {
      await this._subscriptionService.deleteSubscriptionByOrganizationId(orgIdResolved)
      return { ok: true }
    }

    return { ok: true }
  }

  private async sendImportantBillingAlert(event: RazorpayWebhookEvent) {
    const alert = this.buildBillingAlert(event)
    if (!alert) {
      return
    }

    const alertEmail = process.env.BILLING_ALERT_EMAIL
    if (!alertEmail) {
      return
    }

    const dedupeKey = this.billingAlertDedupeKey(event)
    const redisKey = dedupeKey ? `razorpay-billing-alert:${dedupeKey}` : undefined
    if (redisKey) {
      const exists = await ioRedis.get(redisKey)
      if (exists) {
        return
      }
    }

    await this._notificationService.sendEmail(alertEmail, alert.subject, alert.html)

    if (redisKey) {
      await ioRedis.set(redisKey, "1", "EX", 7 * 24 * 60 * 60)
    }
  }

  private buildBillingAlert(event: RazorpayWebhookEvent): { subject: string; html: string } | undefined {
    const eventType = event?.event || ""
    const payment = event.payload?.payment?.entity || {}
    const dispute = event.payload?.dispute?.entity || {}
    const downtime = event.payload?.downtime?.entity || event.payload?.payment?.downtime?.entity || {}

    const alertConfig: Record<string, { subject: string; tone: "critical" | "warning" | "info"; entity: Record<string, any> }> = {
      "payment.failed": {
        subject: "Razorpay payment failed",
        tone: "warning",
        entity: payment,
      },
      "payment.dispute.created": {
        subject: "Razorpay dispute created",
        tone: "critical",
        entity: dispute,
      },
      "payment.dispute.action_required": {
        subject: "Action required for Razorpay dispute",
        tone: "critical",
        entity: dispute,
      },
      "payment.dispute.lost": {
        subject: "Razorpay dispute lost",
        tone: "critical",
        entity: dispute,
      },
      "payment.dispute.won": {
        subject: "Razorpay dispute won",
        tone: "info",
        entity: dispute,
      },
      "payment.dispute.closed": {
        subject: "Razorpay dispute closed",
        tone: "info",
        entity: dispute,
      },
      "payment.downtime.started": {
        subject: "Razorpay downtime started",
        tone: "warning",
        entity: downtime,
      },
      "payment.downtime.resolved": {
        subject: "Razorpay downtime resolved",
        tone: "info",
        entity: downtime,
      },
    }

    const config = alertConfig[eventType]
    if (!config) {
      return undefined
    }

    const entity = config.entity || {}
    const rows = [
      ["Event", eventType],
      ["Severity", config.tone],
      ["Event ID", event.id],
      ["Entity ID", entity.id],
      ["Payment ID", entity.payment_id || payment.id],
      ["Dispute ID", dispute.id],
      ["Order ID", entity.order_id || payment.order_id],
      ["Subscription ID", entity.subscription_id || payment.subscription_id],
      ["Amount", this.formatRazorpayAmount(entity.amount ?? payment.amount, entity.currency || payment.currency)],
      ["Status", entity.status || payment.status],
      ["Reason", entity.reason || entity.error_reason || payment.error_reason],
      ["Error", entity.error_description || payment.error_description],
      ["Method", entity.method || payment.method],
      ["Email", entity.email || payment.email],
      ["Contact", entity.contact || payment.contact],
      ["Created", this.formatRazorpayTimestamp(entity.created_at || event.created_at)],
    ].filter(([, value]) => value !== undefined && value !== null && value !== "")

    return {
      subject: `[FeedVector] ${config.subject}`,
      html: `
        <div>
          <h2>${this.escapeHtml(config.subject)}</h2>
          <p>Razorpay sent an important billing event for FeedVector.</p>
          <table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse;">
            ${rows
              .map(
                ([label, value]) => `<tr><td><strong>${this.escapeHtml(String(label))}</strong></td><td>${this.escapeHtml(String(value))}</td></tr>`,
              )
              .join("")}
          </table>
        </div>
      `,
    }
  }

  private billingAlertDedupeKey(event: RazorpayWebhookEvent) {
    const eventType = event?.event || ""
    const entity: Record<string, any> | undefined =
      event.payload?.payment?.entity ||
      event.payload?.dispute?.entity ||
      event.payload?.downtime?.entity ||
      event.payload?.payment?.downtime?.entity ||
      event.payload?.subscription?.entity

    if (event.id) {
      return event.id
    }

    if (eventType && entity?.id) {
      return `${eventType}:${entity.id}:${entity.status || ""}:${event.created_at || entity.created_at || ""}`
    }

    return undefined
  }

  private formatRazorpayAmount(amount?: number, currency?: string) {
    if (typeof amount !== "number") {
      return undefined
    }

    const formatted = (amount / 100).toFixed(2)
    return `${currency || "INR"} ${formatted}`
  }

  private formatRazorpayTimestamp(value?: number) {
    if (!value) {
      return undefined
    }

    return new Date(value * 1000).toISOString()
  }

  private escapeHtml(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
  }
}
