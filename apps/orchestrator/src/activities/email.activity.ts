import { Injectable } from "@nestjs/common"
import { Activity, ActivityMethod } from "nestjs-temporal-core"
import { EmailService } from "@gitroom/nestjs-libraries/services/email.service"
import { OrganizationService } from "@gitroom/nestjs-libraries/database/prisma/organizations/organization.service"
import { UsersService } from "@gitroom/nestjs-libraries/database/prisma/users/users.service"
import { AuthService } from "@gitroom/helpers/auth/auth.service"

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function getFrontendUrl() {
  return stripTrailingSlash(process.env.FRONTEND_URL || "")
}

function getBackendUrl() {
  return stripTrailingSlash(process.env.NEXT_PUBLIC_BACKEND_URL || `${process.env.FRONTEND_URL}/api` || "")
}

@Injectable()
@Activity()
export class EmailActivity {
  constructor(private _emailService: EmailService, private _organizationService: OrganizationService, private _usersService: UsersService) {}

  @ActivityMethod()
  async sendEmail(to: string, subject: string, html: string, replyTo?: string) {
    return this._emailService.sendEmailSync(to, subject, html, replyTo)
  }

  @ActivityMethod()
  async sendEmailAsync(to: string, subject: string, html: string, sendTo: "top" | "bottom", replyTo?: string) {
    return await this._emailService.sendEmail(to, subject, html, sendTo, replyTo)
  }

  @ActivityMethod()
  async getUserOrgs(id: string) {
    return this._organizationService.getTeam(id)
  }

  @ActivityMethod()
  async getUserLifecycleState(userId: string) {
    const user = await this._usersService.getUserById(userId)
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      activated: user.activated,
      productActivatedAt: (user as any).productActivatedAt ?? null,
      unsubscribedAt: (user as any).unsubscribedAt ?? null,
      emailBouncedAt: (user as any).emailBouncedAt ?? null,
      emailSuppressedAt: (user as any).emailSuppressedAt ?? null,
    }
  }

  @ActivityMethod()
  async getOrgOnboardingLifecycleState(orgId: string) {
    const org = (await this._organizationService.getOnboardingLifecycleState(orgId)) as any
    if (!org) return null
    const owner = org.users?.[0]?.user
    return {
      id: org.id,
      createdAt: org.createdAt,
      isTrailing: org.isTrailing,
      isPaidPro: org.subscription?.deletedAt === null && org.subscription?.subscriptionTier === "PRO",
      owner: owner
        ? {
            id: owner.id,
            email: owner.email,
            name: owner.name,
            createdAt: owner.createdAt,
            activated: owner.activated,
            productActivatedAt: owner.productActivatedAt,
            unsubscribedAt: owner.unsubscribedAt,
            emailBouncedAt: owner.emailBouncedAt,
            emailSuppressedAt: owner.emailSuppressedAt,
          }
        : null,
    }
  }

  @ActivityMethod()
  async getOrgTrialLifecycleState(orgId: string) {
    return this.getOrgOnboardingLifecycleState(orgId)
  }

  @ActivityMethod()
  async getLifecycleEmailContext(userId: string) {
    const frontendUrl = getFrontendUrl()
    const backendUrl = getBackendUrl()
    const replyTo = process.env.LIFECYCLE_REPLY_TO || process.env.EMAIL_FROM_ADDRESS || ""
    const token = AuthService.signJWT({ type: "lifecycle_unsubscribe", id: userId })
    const unsubscribeUrl = `${backendUrl}/email/unsubscribe/${encodeURIComponent(token)}`
    const nextPath = "/launches?onboarding=true"
    const deepLinkUrl = `${frontendUrl}/auth/login?next=${encodeURIComponent(nextPath)}`
    const loomUrl = process.env.LIFECYCLE_LOOM_URL
    const bookingUrl = process.env.LIFECYCLE_BOOKING_URL
    return { frontendUrl, replyTo: replyTo || null, unsubscribeUrl, deepLinkUrl, loomUrl, bookingUrl }
  }

  @ActivityMethod()
  async getTrialEmailContext(userId: string) {
    const frontendUrl = getFrontendUrl()
    const backendUrl = getBackendUrl()
    const replyTo = process.env.LIFECYCLE_REPLY_TO || process.env.EMAIL_FROM_ADDRESS || ""
    const token = AuthService.signJWT({ type: "lifecycle_unsubscribe", id: userId })
    const unsubscribeUrl = `${backendUrl}/email/unsubscribe/${encodeURIComponent(token)}`
    const nextPath = "/billing"
    const billingUrl = `${frontendUrl}/auth/login?next=${encodeURIComponent(nextPath)}`
    return { frontendUrl, replyTo: replyTo || null, unsubscribeUrl, billingUrl }
  }

  @ActivityMethod()
  async sendLifecycleEmailIfEligible(params: { userId: string; subject: string; html: string; sendTo: "top" | "bottom"; replyTo?: string | null }) {
    if (!process.env.FRONTEND_URL) {
      return { sent: false, reason: "missing_frontend_url" as const }
    }
    const user = await this._usersService.getUserById(params.userId)
    if (!user) return { sent: false, reason: "user_not_found" as const }
    const email = user.email || ""
    if (!email || email.indexOf("@") === -1) return { sent: false, reason: "invalid_email" as const }
    if (!user.activated) return { sent: false, reason: "not_activated" as const }
    if ((user as any).productActivatedAt) return { sent: false, reason: "product_activated" as const }
    if ((user as any).unsubscribedAt) return { sent: false, reason: "unsubscribed" as const }
    if ((user as any).emailBouncedAt) return { sent: false, reason: "bounced" as const }
    if ((user as any).emailSuppressedAt) return { sent: false, reason: "suppressed" as const }

    await this._emailService.sendEmail(email, params.subject, params.html, params.sendTo, params.replyTo || undefined)
    return { sent: true }
  }

  @ActivityMethod()
  async sendOnboardingLifecycleEmailIfEligible(params: {
    orgId: string
    subject: string
    html: string
    sendTo: "top" | "bottom"
    expectedOwnerUserId?: string
    replyTo?: string | null
  }) {
    if (!process.env.FRONTEND_URL) {
      return { sent: false, reason: "missing_frontend_url" as const }
    }
    const org = await this.getOrgOnboardingLifecycleState(params.orgId)
    if (!org) return { sent: false, reason: "org_not_found" as const }
    if (org.isPaidPro) return { sent: false, reason: "paid_pro" as const }
    const user = org.owner
    if (!user) return { sent: false, reason: "owner_not_found" as const }
    if (params.expectedOwnerUserId && user.id !== params.expectedOwnerUserId) {
      return { sent: false, reason: "owner_changed" as const }
    }
    const email = user.email || ""
    if (!email || email.indexOf("@") === -1) return { sent: false, reason: "invalid_email" as const }
    if (!user.activated) return { sent: false, reason: "not_activated" as const }
    if (user.productActivatedAt) return { sent: false, reason: "product_activated" as const }
    if (user.unsubscribedAt) return { sent: false, reason: "unsubscribed" as const }
    if (user.emailBouncedAt) return { sent: false, reason: "bounced" as const }
    if (user.emailSuppressedAt) return { sent: false, reason: "suppressed" as const }

    await this._emailService.sendEmail(email, params.subject, params.html, params.sendTo, params.replyTo || undefined)
    return { sent: true }
  }

  @ActivityMethod()
  async sendTrialLifecycleEmailIfEligible(params: {
    orgId: string
    subject: string
    html: string
    sendTo: "top" | "bottom"
    expectedOwnerUserId?: string
    replyTo?: string | null
  }) {
    if (!process.env.FRONTEND_URL) {
      return { sent: false, reason: "missing_frontend_url" as const }
    }
    const org = await this.getOrgTrialLifecycleState(params.orgId)
    if (!org) return { sent: false, reason: "org_not_found" as const }
    if (!org.isTrailing) return { sent: false, reason: "not_trialing" as const }
    if (org.isPaidPro) return { sent: false, reason: "paid_pro" as const }
    const user = org.owner
    if (!user) return { sent: false, reason: "owner_not_found" as const }
    if (params.expectedOwnerUserId && user.id !== params.expectedOwnerUserId) {
      return { sent: false, reason: "owner_changed" as const }
    }
    const email = user.email || ""
    if (!email || email.indexOf("@") === -1) return { sent: false, reason: "invalid_email" as const }
    if (!user.activated) return { sent: false, reason: "not_activated" as const }
    if (user.unsubscribedAt) return { sent: false, reason: "unsubscribed" as const }
    if (user.emailBouncedAt) return { sent: false, reason: "bounced" as const }
    if (user.emailSuppressedAt) return { sent: false, reason: "suppressed" as const }

    await this._emailService.sendEmail(email, params.subject, params.html, params.sendTo, params.replyTo || undefined)
    return { sent: true }
  }

  @ActivityMethod()
  async setStreak(organizationId: string, type: "start" | "end") {
    return this._organizationService.setStreak(organizationId, type)
  }
}
