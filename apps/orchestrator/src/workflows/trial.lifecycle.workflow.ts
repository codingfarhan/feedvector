import { proxyActivities, sleep } from "@temporalio/workflow"
import { EmailActivity } from "@gitroom/orchestrator/activities/email.activity"

const { getOrgTrialLifecycleState, getTrialEmailContext, sendTrialLifecycleEmailIfEligible } = proxyActivities<EmailActivity>({
  startToCloseTimeout: "10 minute",
  taskQueue: "main",
  cancellationType: "ABANDON",
  retry: {
    maximumAttempts: 3,
    backoffCoefficient: 1,
    initialInterval: "2 minutes",
  },
})

type TrialLifecycleOwnerState = {
  id: string
  email: string
  name: string | null
  activated: boolean
  unsubscribedAt: string | Date | null
  emailBouncedAt: string | Date | null
  emailSuppressedAt: string | Date | null
}

type OrgTrialLifecycleState = {
  id: string
  createdAt: string | Date
  isTrailing: boolean
  isPaidPro: boolean
  owner: TrialLifecycleOwnerState | null
}

type TrialEmailContext = {
  billingUrl: string
  unsubscribeUrl: string
  replyTo?: string | null
}

type EmailContent = {
  subject: string
  html: string
}

type CtaVariant = "primary" | "secondary"

const ms = {
  day: 24 * 60 * 60 * 1000,
}

function toEpochMs(value: string | Date) {
  return typeof value === "string" ? new Date(value).getTime() : value.getTime()
}

async function sleepUntil(targetEpochMs: number) {
  const remaining = targetEpochMs - Date.now()
  if (remaining > 0) {
    await sleep(remaining)
  }
}

function shouldSkipTrialLifecycle(org: OrgTrialLifecycleState) {
  if (!org.isTrailing) return true
  if (org.isPaidPro) return true

  const user = org.owner
  if (!user) return true
  if (!user.email || user.email.indexOf("@") === -1) return true
  if (!user.activated) return true
  if (user.unsubscribedAt || user.emailBouncedAt || user.emailSuppressedAt) return true

  return false
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
}

function safeHref(url: string) {
  return escapeHtml(url)
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

function list(items: string[]) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0 0 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:380px;">
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

function unsubscribeFooter(unsubscribeUrl: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:32px 0 0 0;padding-top:20px;border-top:1px solid #e5e7eb;">
      <tr>
        <td align="center" style="color:#9ca3af;font-size:12px;line-height:18px;text-align:center;">
          You’re getting this because you started a Feedvector trial.
          <br />
          Don’t want trial lifecycle emails? <a href="${safeHref(unsubscribeUrl)}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>.
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

function emailTrialEndsTomorrow(ctx: TrialEmailContext): EmailContent {
  return {
    subject: "Your Feedvector trial ends tomorrow",
    html: emailShell({
      title: "Your trial ends tomorrow",
      preheaderText: "Keep your workspace active and keep building momentum on social.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("Your 7-day Feedvector trial ends tomorrow.")}
        ${paragraph(
          "If growing on social is still a goal, upgrade to Pro to keep your workspace active and continue building momentum without interruption.",
        )}
        ${cta("Upgrade to Pro", ctx.billingUrl)}
        ${callout(
          "Tip: Keep your scheduled posts, connected channels, and publishing workflow running. The goal is not just to post once but to stay consistent long enough to grow.",
        )}
      `,
    }),
  }
}

function emailTrialEnded(ctx: TrialEmailContext): EmailContent {
  return {
    subject: "Your Feedvector trial has ended 😢",
    html: emailShell({
      title: "Your trial has ended",
      preheaderText: "Upgrade to Pro to keep scheduling posts and growing your social presence.",
      unsubscribeUrl: ctx.unsubscribeUrl,
      children: `
        ${paragraph("Your 7-day Feedvector trial has ended.")}
        ${paragraph("You can upgrade to Pro to continue scheduling posts, managing channels, and building a system for consistent social growth.")}
        ${cta("Upgrade to Pro", ctx.billingUrl)}
        ${mutedParagraph(
          "Not sure if Pro is the right fit? Reply to this email and tell me what you are trying to grow (clients? audience? visibility?) or if you're just trying to stay consistent.",
        )}
        ${list(["Keep your workspace active", "Continue scheduling posts", "Stay consistent with your social growth plan"])}
      `,
    }),
  }
}

export async function trialLifecycleWorkflow({ orgId }: { orgId: string }) {
  const org = (await getOrgTrialLifecycleState(orgId)) as OrgTrialLifecycleState | null
  if (!org || shouldSkipTrialLifecycle(org)) return

  const trialStartedAtMs = toEpochMs(org.createdAt)
  const trialEndsAtMs = trialStartedAtMs + 7 * ms.day
  const startedAtMs = Date.now()

  if (startedAtMs > trialEndsAtMs + ms.day) {
    return
  }

  const trialCtx = (await getTrialEmailContext(org.owner!.id)) as TrialEmailContext
  const expectedOwnerUserId = org.owner!.id

  await sleepUntil(trialEndsAtMs - ms.day)
  if (Date.now() < trialEndsAtMs) {
    const orgDay6 = (await getOrgTrialLifecycleState(orgId)) as OrgTrialLifecycleState | null
    if (!orgDay6 || shouldSkipTrialLifecycle(orgDay6)) return

    const { subject, html } = emailTrialEndsTomorrow(trialCtx)
    await sendTrialLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
    })
  }

  await sleepUntil(trialEndsAtMs)
  const orgDay7 = (await getOrgTrialLifecycleState(orgId)) as OrgTrialLifecycleState | null
  if (!orgDay7 || shouldSkipTrialLifecycle(orgDay7)) return

  {
    const { subject, html } = emailTrialEnded(trialCtx)
    await sendTrialLifecycleEmailIfEligible({
      orgId,
      subject,
      html,
      sendTo: "bottom",
      expectedOwnerUserId,
      replyTo: trialCtx.replyTo,
    })
  }
}
