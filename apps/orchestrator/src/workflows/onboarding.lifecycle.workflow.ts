import { condition, proxyActivities, setHandler } from "@temporalio/workflow"
import { EmailActivity } from "@gitroom/orchestrator/activities/email.activity"
import { onboardingProductActivatedSignal } from "@gitroom/orchestrator/signals/onboarding.lifecycle.signal"

const { getOrgOnboardingLifecycleState, getLifecycleEmailContext, sendOnboardingLifecycleEmailIfEligible } = proxyActivities<EmailActivity>({
  startToCloseTimeout: "10 minute",
  taskQueue: "main",
  cancellationType: "ABANDON",
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: "2 minutes",
  },
})

type OnboardingLifecycleOwnerState = {
  id: string
  email: string
  name: string | null
  createdAt: string | Date
  activated: boolean
  productActivatedAt: string | Date | null
  unsubscribedAt: string | Date | null
  emailBouncedAt: string | Date | null
  emailSuppressedAt: string | Date | null
}

type OrgOnboardingLifecycleState = {
  id: string
  createdAt: string | Date
  isTrailing: boolean
  isPaidPro: boolean
  owner: OnboardingLifecycleOwnerState | null
}

type LifecycleEmailContext = {
  deepLinkUrl: string
  unsubscribeUrl: string
  replyTo?: string | null
  loomUrl?: string | null
  bookingUrl?: string | null
}

type EmailContent = {
  subject: string
  html: string
}

type CtaVariant = "primary" | "secondary"

const ms = {
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
}

const MAX_USER_AGE_DAYS_FOR_LIFECYCLE = 14

function toEpochMs(value: string | Date) {
  return typeof value === "string" ? new Date(value).getTime() : value.getTime()
}

async function sleepUntil(targetEpochMs: number, shouldAbort: () => boolean) {
  const now = Date.now()
  const remaining = targetEpochMs - now

  if (remaining > 0) {
    await condition(() => shouldAbort(), remaining)
  }
}

function shouldSkipLifecycle(org: OrgOnboardingLifecycleState) {
  if (org.isPaidPro) return true

  const user = org.owner
  if (!user) return true
  if (!user.email || user.email.indexOf("@") === -1) return true
  if (!user.activated) return true
  if (user.productActivatedAt) return true
  if (user.unsubscribedAt || user.emailBouncedAt || user.emailSuppressedAt) return true

  return false
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function safeHref(url: string) {
  return escapeHtml(url)
}

function hasUrl(url: string | null | undefined): url is string {
  return Boolean(url && url.trim())
}

function preheader(text: string) {
  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;line-height:1px;font-size:1px;">
      ${escapeHtml(text)}
    </div>
  `
}

function cta(text: string, url: string, variant: CtaVariant = "primary") {
  const isPrimary = variant === "primary"
  const background = isPrimary ? "#111827" : "#ffffff"
  const color = isPrimary ? "#ffffff" : "#111827"
  const border = isPrimary ? "#111827" : "#d1d5db"

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:24px auto 0 auto;">
      <tr>
        <td align="center" bgcolor="${background}" style="border-radius:10px;border:1px solid ${border};">
          <a href="${safeHref(url)}" style="
            display:inline-block;
            padding:13px 18px;
            color:${color};
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
            font-size:14px;
            font-weight:700;
            line-height:20px;
            text-decoration:none;
            border-radius:10px;
          ">${escapeHtml(text)}</a>
        </td>
      </tr>
    </table>
  `
}

function textLink(text: string, url: string) {
  return `<a href="${safeHref(url)}" style="color:#111827;text-decoration:underline;font-weight:700;">${escapeHtml(text)}</a>`
}

function sectionLabel(text: string) {
  return `
    <p style="
      margin:24px auto 12px auto;
      max-width:460px;
      color:#6b7280;
      font-size:12px;
      line-height:16px;
      font-weight:700;
      letter-spacing:0.08em;
      text-transform:uppercase;
      text-align:center;
    ">${escapeHtml(text)}</p>
  `
}

function paragraph(html: string) {
  return `
    <p style="margin:16px auto 0 auto;max-width:460px;color:#374151;font-size:16px;line-height:26px;text-align:center;">
      ${html}
    </p>
  `
}

function mutedParagraph(html: string) {
  return `
    <p style="margin:16px auto 0 auto;max-width:460px;color:#6b7280;font-size:14px;line-height:22px;text-align:center;">
      ${html}
    </p>
  `
}

function list(items: string[]) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 0 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:360px;">
            ${items
              .map(
                (item) => `
                  <tr>
                    <td width="24" valign="top" style="padding:0 0 10px 0;color:#111827;font-size:16px;line-height:24px;text-align:left;">•</td>
                    <td valign="top" style="padding:0 0 10px 0;color:#374151;font-size:15px;line-height:24px;text-align:left;">
                      ${escapeHtml(item)}
                    </td>
                  </tr>
                `,
              )
              .join("")}
          </table>
        </td>
      </tr>
    </table>
  `
}

function callout(html: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:460px;">
            <tr>
              <td align="center" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:16px 18px;color:#374151;font-size:14px;line-height:22px;text-align:center;">
                ${html}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

function unsubscribeFooter(unsubscribeUrl: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0 0 0;padding-top:20px;border-top:1px solid #e5e7eb;">
      <tr>
        <td align="center" style="color:#9ca3af;font-size:12px;line-height:18px;text-align:center;">
          You’re getting this because you started setting up Feedvector.
          <br />
          Don’t want onboarding emails? <a href="${safeHref(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>.
        </td>
      </tr>
    </table>
  `
}

function emailShell({
  title,
  preheaderText,
  children,
  unsubscribeUrl,
}: {
  title: string
  preheaderText: string
  children: string
  unsubscribeUrl: string
}) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <title>${escapeHtml(title)}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f4f6;">
        ${preheader(preheaderText)}
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
                <tr>
                  <td align="center" style="padding:32px 28px 26px 28px;background:#ffffff;text-align:center;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:800;letter-spacing:-0.01em;text-align:center;">
                          Feedvector
                        </td>
                      </tr>
                    </table>

                    <div style="height:24px;line-height:24px;">&nbsp;</div>

                    <h1 style="margin:0 auto;color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:28px;line-height:36px;font-weight:800;letter-spacing:-0.03em;text-align:center;">
                      ${escapeHtml(title)}
                    </h1>

                    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;text-align:center;">
                      ${children}
                      ${unsubscribeFooter(unsubscribeUrl)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

function emailWelcome(user: OnboardingLifecycleOwnerState, ctx: LifecycleEmailContext): EmailContent {
  const loomLine = hasUrl(ctx.loomUrl)
    ? mutedParagraph(`Prefer watching a video walkthrough? ${textLink("Watch the 2-minute setup video", ctx.loomUrl)}.`)
    : ""

  return {
    subject: "Your workspace is ready! 🥳",
    html: emailShell({
      title: `Let's start growing on Social Media!`,
      preheaderText: "Create your first post or watch the quick setup video.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("The fastest way to get value from Feedvector is to schedule or publish your first post.")}
        ${paragraph("Start with one channel, one idea, and one post. You can make the workspace fancier later.")}
        ${cta("Create your first post", ctx.deepLinkUrl)}
        ${loomLine}
      `,
    }),
  }
}

function email24h(ctx: LifecycleEmailContext): EmailContent {
  const primaryCta = hasUrl(ctx.loomUrl) ? cta("Watch the setup video", ctx.loomUrl) : cta("Continue setup", ctx.deepLinkUrl)

  const secondaryCta = hasUrl(ctx.loomUrl) ? cta("Continue setup", ctx.deepLinkUrl, "secondary") : ""

  return {
    subject: "Helping you setup Feedvector",
    html: emailShell({
      title: "Get your first post scheduled today",
      preheaderText: "A quick setup walkthrough to help you get moving.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("Your audience will not grow from ideas sitting in drafts. Get your first post scheduled right now and build from there.")}
        ${paragraph("I recorded a short walkthrough showing the fastest way to get setup.")}
        ${primaryCta}
        ${secondaryCta}
        ${callout("Tip: Do not overthink the full content calendar yet 😉 Connect one channel, create one post and schedule it. ")}
      `,
    }),
  }
}

function email3d(ctx: LifecycleEmailContext): EmailContent {
  const primaryCta = hasUrl(ctx.bookingUrl) ? cta("Book a free setup call", ctx.bookingUrl) : cta("Try the starter workflow", ctx.deepLinkUrl)

  const secondaryCta = hasUrl(ctx.bookingUrl) ? cta("Try the starter workflow", ctx.deepLinkUrl, "secondary") : ""

  return {
    subject: "Want me to help set up your workspace?",
    html: emailShell({
      title: "Let’s get your workspace set up",
      preheaderText: "Book a free setup call or try the starter workflow yourself.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("If Feedvector is still sitting half-set-up, I can help you get it over the line.")}
        ${paragraph("On the setup call, we can connect the right channel, pick a simple workflow, and get your first posts scheduled.")}
        ${primaryCta}
        ${secondaryCta}
        ${sectionLabel("Starter workflow")}
        ${list(["Pick one channel", "Use a template or paste a rough idea", "Schedule 3 posts for this week"])}
      `,
    }),
  }
}

function email7d(ctx: LifecycleEmailContext): EmailContent {
  const bookingCta = hasUrl(ctx.bookingUrl) ? cta("Book a setup call", ctx.bookingUrl) : ""
  const restartCta = cta("Restart onboarding", ctx.deepLinkUrl, hasUrl(ctx.bookingUrl) ? "secondary" : "primary")

  return {
    subject: "Need help getting started?",
    html: emailShell({
      title: "Still need help getting started?",
      preheaderText: "Reply with what you need or book a setup call.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("If you still want to grow on social but have not started yet, reply and tell me your goal.")}
        ${paragraph("I can point you to the right way to set it up, or you can book a free workspace setup call.")}
        ${bookingCta}
        ${restartCta}
        ${callout("Tip: Good enough setup beats perfect setup. One connected channel and one scheduled post is the win here.")}
      `,
    }),
  }
}

export async function onboardingLifecycleWorkflow({ orgId }: { orgId: string }) {
  let productActivated = false
  setHandler(onboardingProductActivatedSignal, () => {
    productActivated = true
  })

  const org = (await getOrgOnboardingLifecycleState(orgId)) as OrgOnboardingLifecycleState | null
  if (!org || shouldSkipLifecycle(org)) return

  const lifecycleCtx = (await getLifecycleEmailContext(org.owner!.id)) as LifecycleEmailContext
  const expectedOwnerUserId = org.owner!.id

  const createdAtMs = toEpochMs(org.createdAt)
  const startedAtMs = Date.now()
  if (startedAtMs - createdAtMs > MAX_USER_AGE_DAYS_FOR_LIFECYCLE * ms.day) {
    return
  }

  const baselineMs = Math.max(createdAtMs, startedAtMs)

  // Email 1: Welcome, immediate.
  {
    const { subject, html } = emailWelcome(org.owner!, lifecycleCtx)
    await sendOnboardingLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
    })
  }

  // Email 2: Setup walkthrough, +24h.
  await sleepUntil(baselineMs + ms.day, () => productActivated)
  if (productActivated) return

  const org24 = (await getOrgOnboardingLifecycleState(orgId)) as OrgOnboardingLifecycleState | null
  if (!org24 || shouldSkipLifecycle(org24)) return

  {
    const { subject, html } = email24h(lifecycleCtx)
    await sendOnboardingLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
    })
  }

  // Email 3: Setup call + starter workflow, +3d.
  await sleepUntil(baselineMs + 3 * ms.day, () => productActivated)
  if (productActivated) return

  const org3d = (await getOrgOnboardingLifecycleState(orgId)) as OrgOnboardingLifecycleState | null
  if (!org3d || shouldSkipLifecycle(org3d)) return

  {
    const { subject, html } = email3d(lifecycleCtx)
    await sendOnboardingLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
    })
  }

  // Email 4: Personal help / reply-to, +7d.
  await sleepUntil(baselineMs + 7 * ms.day, () => productActivated)
  if (productActivated) return

  const org7d = (await getOrgOnboardingLifecycleState(orgId)) as OrgOnboardingLifecycleState | null
  if (!org7d || shouldSkipLifecycle(org7d)) return

  {
    const { subject, html } = email7d(lifecycleCtx)
    await sendOnboardingLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
      replyTo: lifecycleCtx.replyTo,
    })
  }
}
