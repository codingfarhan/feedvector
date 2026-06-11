"use client"

import useSWR from "swr"
import { ReactNode, useCallback, useMemo } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { LoadingComponent } from "@gitroom/frontend/components/layout/loading"

type AnalyticsDataItem = {
  label: string
  total?: string | number
  data?: Array<{ total: number; date: string; label?: string }>
}

const LATEST_LINKEDIN_POSTS_KEY = -1

const campaignPosts = [
  {
    day: "Monday",
    type: "Problem Education",
    topic: "Why your CRM feels messy even when your team uses it daily",
    hook: "Your CRM is not the problem. Your sales process is.",
    goal: "Build pain awareness",
    funnel: "Awareness",
    cta: "Ask readers what bottleneck they are seeing",
    status: "Draft ready",
  },
  {
    day: "Wednesday",
    type: "POV",
    topic: "Why more automation will not fix weak follow-up",
    hook: "Most teams do not need more reminders. They need clearer ownership.",
    goal: "Shift the audience belief",
    funnel: "Trust",
    cta: "Invite operators to share what they see",
    status: "Needs review",
  },
  {
    day: "Thursday",
    type: "Proof / Case Study",
    topic: "A small workflow change that reduced manual follow-up",
    hook: "The fix was not a bigger CRM. It was a cleaner handoff.",
    goal: "Show credibility without hard selling",
    funnel: "Trust",
    cta: "Ask for similar process bottlenecks",
    status: "Needs proof",
  },
  {
    day: "Friday",
    type: "Product / Service Education",
    topic: "How to spot the first sign your pipeline process is breaking",
    hook: "Messy pipeline reviews usually start weeks before the meeting.",
    goal: "Bridge the problem to the service",
    funnel: "Conversion",
    cta: "Soft DM prompt",
    status: "Needs CTA",
  },
]

const opportunities = [
  {
    source: "Website service page",
    insight: "You mention reducing manual sales follow-up.",
    angle: "Manual follow-up is not a discipline problem. It is a workflow problem.",
    type: "Problem Education",
  },
  {
    source: "LinkedIn profile",
    insight: "Your headline emphasizes practical revenue operations work.",
    angle: "The best RevOps work is usually invisible until the process breaks.",
    type: "POV",
  },
  {
    source: "Past post",
    insight: "Contrarian one-liners are easier for your audience to engage with.",
    angle: "More dashboards do not create better decisions. Better questions do.",
    type: "Point of View",
  },
  {
    source: "Analytics",
    insight: "Audience response is strongest around process breakdowns.",
    angle: "Show the before and after of a messy handoff becoming a clean workflow.",
    type: "Proof / Case Study",
  },
]

const inputItems = [
  {
    missing: "Add a proof point for Thursday's case study post.",
    why: "The draft needs one real observation before it can support a trust-building post.",
    fix: "Add a client, project, or internal example without inventing metrics.",
  },
  {
    missing: "Review the offer CTA.",
    why: "No booking link or preferred next step was found.",
    fix: "Choose whether the CTA should invite a DM, comment, or booking link.",
  },
  {
    missing: "Choose a sharper opinion for Wednesday's POV post.",
    why: "A stronger belief will make the campaign feel less generic.",
    fix: "Pick the view you would defend in front of a peer.",
  },
]

const contentAssets = [
  { label: "Positioning", value: "Practical LinkedIn content strategy for operators and service-led founders" },
  { label: "Target audience", value: "Founders, consultants, and business owners who need authority-led demand" },
  { label: "Services/offers", value: "Content strategy, ghostwriting, positioning, weekly campaign planning" },
  { label: "Credibility points", value: "Hands-on operator experience, repeatable strategy system, analytics-informed writing" },
  { label: "Beliefs/POVs", value: "Good content should move a buyer through awareness, trust, and conversion" },
  { label: "Proof points", value: "Needs more testimonials, case studies, and concrete client observations" },
  { label: "Audience pains", value: "Inconsistent posting, weak hooks, generic AI drafts, unclear positioning" },
]

const DashboardCard = ({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) => (
  <section className={`rounded-[10px] border border-newTableBorder bg-newTableHeader p-[16px] ${className}`}>
    <h2 className="text-[16px] font-semibold text-newTextColor">{title}</h2>
    {children}
  </section>
)

const Badge = ({ children, tone = "purple" }: { children: ReactNode; tone?: "purple" | "green" | "blue" | "orange" | "gray" }) => {
  const colors = {
    purple: "border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6]",
    green: "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]",
    blue: "border-[#0a66c2]/30 bg-[#0a66c2]/10 text-[#0a66c2]",
    orange: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]",
    gray: "border-newTableBorder bg-newBgColorInner text-customColor18",
  }

  return <span className={`inline-flex rounded-full border px-[9px] py-[4px] text-[12px] font-semibold ${colors[tone]}`}>{children}</span>
}

const getAnalyticsValue = (analytics: AnalyticsDataItem[] | undefined, label: string) => {
  const item = analytics?.find((row) => row.label === label)
  if (!item) {
    return "Not enough data yet"
  }
  if (typeof item.total !== "undefined") {
    return item.total
  }
  const total = item.data?.reduce((sum, point) => sum + point.total, 0) || 0
  return total ? new Intl.NumberFormat().format(total) : "Not enough data yet"
}

export const LinkedinStrategyDashboard = () => {
  const fetch = useFetch()

  const loadIntegrations = useCallback(async () => {
    const integrations = (await (await fetch("/integrations/list")).json()).integrations || []
    return integrations
  }, [fetch])

  const { data: integrations = [], isLoading: integrationsLoading } = useSWR("analytics-list", loadIntegrations, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })

  const linkedinIntegration = useMemo(
    () => integrations.find((integration: any) => integration.identifier === "linkedin" && !integration.inBetweenSteps),
    [integrations],
  )

  const loadAnalytics = useCallback(async () => {
    if (!linkedinIntegration) {
      return []
    }
    return (await fetch(`/analytics/${linkedinIntegration.id}?date=${LATEST_LINKEDIN_POSTS_KEY}`)).json()
  }, [fetch, linkedinIntegration])

  const { data: analytics = [], isLoading: analyticsLoading } = useSWR(
    linkedinIntegration ? `/analytics-${linkedinIntegration.id}-${LATEST_LINKEDIN_POSTS_KEY}` : null,
    loadAnalytics,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  const analyticsSummary = useMemo(
    () => ({
      bestTopic: "Sales process breakdowns",
      bestHook: "Contrarian one-liners",
      bestFormat: "Problem diagnosis posts",
      bestCta: "Specific peer questions",
      bestTime: "Thursday morning",
      weakestArea: "Product education posts",
      totalEngagement: getAnalyticsValue(analytics, "Total engagement"),
      averageEngagement: getAnalyticsValue(analytics, "Average engagement per post"),
    }),
    [analytics],
  )

  if (integrationsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-newBgColorInner">
        <LoadingComponent />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-newBgColorInner p-[18px] text-newTextColor">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-[16px]">
        <section className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[820px]">
              <div className="text-[13px] font-semibold uppercase tracking-[0.08em] text-customColor18">Present Content strategy:</div>
              <h1 className="mt-[6px] text-[28px] font-semibold leading-[34px]">Build authority around sales workflow problems</h1>
              <p className="mt-[8px] text-[14px] leading-[21px] text-customColor18">
                Core narrative: manual follow-up is usually a workflow problem, not a motivation problem.
              </p>
              <div className="mt-[14px] flex flex-wrap gap-[8px]">
                <Badge tone="purple">Goal: Build authority</Badge>
                <Badge tone="blue">Audience: Founders and operators</Badge>
                <Badge tone="gray">Offer: LinkedIn ghostwriting strategy</Badge>
              </div>
            </div>
            <div className="w-full rounded-[10px] bg-newBgColorInner p-[12px] lg:w-[340px]">
              <button className="h-[44px] w-full rounded-[10px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] px-[16px] text-[14px] font-semibold text-white">
                Build this week's content campaign
              </button>
              <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
                <div>
                  <div className="text-[12px] text-customColor18">Engagement</div>
                  <div className="mt-[3px] text-[18px] font-semibold">{analyticsSummary.totalEngagement}</div>
                </div>
                <div>
                  <div className="text-[12px] text-customColor18">Avg/post</div>
                  <div className="mt-[3px] text-[18px] font-semibold">{analyticsSummary.averageEngagement}</div>
                </div>
              </div>
              {analyticsLoading && <div className="mt-[8px] text-[12px] text-customColor18">Refreshing analytics...</div>}
            </div>
          </div>
        </section>

        <div className="grid gap-[16px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <DashboardCard title="Suggested posts for this week">
            <div className="mt-[12px] divide-y divide-newTableBorder overflow-hidden rounded-[10px] border border-newTableBorder">
              {campaignPosts.map((post) => (
                <article key={`${post.day}-${post.type}`} className="bg-newBgColorInner p-[14px]">
                  <div className="grid gap-[10px] lg:grid-cols-[140px_minmax(0,1fr)_210px] lg:items-center">
                    <div>
                      <div className="text-[15px] font-semibold">{post.day}</div>
                      <div className="mt-[4px] text-[12px] text-customColor18">{post.type}</div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold">{post.topic}</div>
                      <div className="mt-[5px] truncate text-[13px] text-customColor18">{post.hook}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-[6px] lg:justify-end">
                      <Badge tone={post.funnel === "Conversion" ? "green" : post.funnel === "Trust" ? "blue" : "purple"}>{post.funnel}</Badge>
                      <Badge tone={post.status === "Draft ready" ? "green" : "orange"}>{post.status}</Badge>
                      <button className="rounded-[8px] border border-[#8b5cf6]/40 px-[10px] py-[6px] text-[12px] font-semibold">View/Edit</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </DashboardCard>

          <div className="flex flex-col gap-[16px]">
            <DashboardCard title="New content opportunities">
              <div className="mt-[12px] flex flex-col gap-[10px]">
                {opportunities.slice(0, 3).map((item) => (
                  <div key={item.angle} className="rounded-[10px] bg-newBgColorInner p-[12px]">
                    <div className="flex items-center justify-between gap-[8px]">
                      <Badge tone="gray">{item.source}</Badge>
                      <button className="text-[12px] font-semibold text-[#8b5cf6]">Turn into post</button>
                    </div>
                    <div className="mt-[8px] text-[13px] leading-[19px]">{item.angle}</div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title="Needs your input">
              <div className="mt-[12px] flex flex-col gap-[10px]">
                {inputItems.slice(0, 2).map((item) => (
                  <div key={item.missing} className="rounded-[10px] bg-newBgColorInner p-[12px]">
                    <div className="text-[13px] font-semibold">{item.missing}</div>
                    <div className="mt-[5px] text-[12px] leading-[18px] text-customColor18">{item.fix}</div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>

        <div className="grid gap-[16px] xl:grid-cols-[minmax(0,0.85fr)_minmax(0,0.85fr)_minmax(0,1.3fr)]">
          <DashboardCard title="What's working">
            <div className="mt-[12px] grid grid-cols-2 gap-[8px] text-[13px]">
              {[
                ["Best topic", analyticsSummary.bestTopic],
                ["Best hook", analyticsSummary.bestHook],
                ["Best format", analyticsSummary.bestFormat],
                ["Best CTA", analyticsSummary.bestCta],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[9px] bg-newBgColorInner p-[10px]">
                  <div className="text-[11px] text-customColor18">{label}</div>
                  <div className="mt-[4px] font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-[10px] rounded-[9px] bg-newBgColorInner p-[10px] text-[13px] leading-[19px] text-customColor18">
              Next action: make product posts more story-led and less feature-led.
            </div>
          </DashboardCard>

          <DashboardCard title="Voice and positioning">
            <div className="mt-[12px] grid gap-[8px]">
              {[
                ["Voice match", "82%"],
                ["Audience clarity", "78%"],
                ["Offer clarity", "71%"],
                ["Issue", "Draft 3 sounds too promotional"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-[12px] rounded-[9px] bg-newBgColorInner px-[10px] py-[8px]">
                  <span className="text-[13px] text-customColor18">{label}</span>
                  <span className="text-right text-[13px] font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Your content assets">
            <div className="mt-[12px] grid gap-[8px] md:grid-cols-2">
              {contentAssets.slice(0, 6).map((asset) => (
                <div key={asset.label} className="rounded-[9px] bg-newBgColorInner p-[10px]">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-customColor18">{asset.label}</div>
                  <div className="mt-[5px] line-clamp-2 text-[13px] leading-[19px]">{asset.value}</div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        {!linkedinIntegration && (
          <div className="rounded-[12px] border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-[14px] text-[14px] text-newTextColor">
            Connect a personal LinkedIn profile to replace the mocked strategy inputs with account-specific recommendations.
          </div>
        )}
      </div>
    </div>
  )
}
