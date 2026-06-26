"use client"

import useSWR from "swr"
import dayjs from "dayjs"
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { LoadingComponent } from "@gitroom/frontend/components/layout/loading"
import { expandPosts } from "@gitroom/helpers/utils/posts.list.minify"
import { useToaster } from "@gitroom/react/toaster/toaster"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import { useModals } from "@gitroom/frontend/components/layout/new-modal"
import { AddEditModal } from "@gitroom/frontend/components/new-launch/add.edit.modal"
import { ExistingDataContextProvider } from "@gitroom/frontend/components/launches/helpers/use.existing.data"
import { deleteDialog } from "@gitroom/react/helpers/delete.dialog"
import { ChevronDownIcon, TrashIcon } from "@gitroom/frontend/components/ui/icons"
import { useAddProvider } from "@gitroom/frontend/components/launches/add.provider.component"
import { Slider } from "@gitroom/react/form/slider"

type AnalyticsDataItem = {
  key?: string
  label: string
  total?: string | number
  data?: Array<{ total: number; date: string; label?: string }>
  recommendation?: string
  meta?: Record<string, any>
}

type OnboardingSuggestion = {
  id: string
  templateId: string
  templateName: string
  pillar: string
  role: string
  audience: string
  goal: string
  ctaStyle?: string
  proofRequirement?: string
  content: string
}

type CampaignPost = {
  id: string
  group?: string
  content?: string
  publishDate?: string
  state?: string
  integration?: {
    id: string
  }
  generationMetadata?: {
    source?: string
    campaignWeekStart?: string
    campaignSlot?: number
    recommendedDate?: string
    postType?: string
    topic?: string
    hookDirection?: string
    goal?: string
    audience?: string
    pillar?: string
    templateName?: string
    funnelStage?: string
    ctaStyle?: string
    statusReason?: string
  }
}

type RepurposeSource = "website" | "past_posts" | "profile"

type RepurposeSourceConfig = {
  id: RepurposeSource
  source: string
  sentence: string
  shortDescription: string
  button: string
}

type RepurposeTopPost = {
  label: string
  date?: string
  total?: number
}

type RepurposeGenerateInput = {
  sourceType: RepurposeSource
  websiteUrl?: string
  selectedPosts?: RepurposeTopPost[]
  profileFocus?: string
  additionalContext?: string
  visualContext?: string
}

type WeeklyCampaignQuestion = {
  question: string
  fills: string[]
}

type WeeklyCampaignPlanItem = {
  id: string
  slot: number
  date?: string
  templateId: string
  templateName: string
  pillar: string
  proofRequirement: string
  questions: WeeklyCampaignQuestion[]
  analyticsRecommended?: boolean
  why: string
}

type WeeklyCampaignConfirmedItem = WeeklyCampaignPlanItem & {
  answers: Array<WeeklyCampaignQuestion & { answer: string }>
  useContextFromProfileAndWebsite?: boolean
}

type WeeklyCampaignAnalyticsHints = {
  bestTopic: string
  bestHook: string
  bestFormat: string
  bestCta: string
  nextAction: string
}

type LinkedinProfileOptimizationResult = {
  currentHeadline: string
  currentAbout: string
  suggestedHeadline: string
  suggestedAbout: string
  desiredPositioning?: string
}

const LATEST_LINKEDIN_POSTS_KEY = -1
const WEEKLY_CAMPAIGN_SOURCE = "weekly_dashboard_campaign"
const ONBOARDING_CAMPAIGN_SOURCE = "onboarding"
const CONTENT_CONTEXT_STALE_MS = 15 * 24 * 60 * 60 * 1000

const repurposeSources: RepurposeSourceConfig[] = [
  {
    id: "website",
    source: "Website page",
    sentence: "💡 Paste a page URL and we will turn the page's content into a LinkedIn post for your audience.",
    shortDescription: "Turn a page URL into a LinkedIn post.",
    button: "Turn into post",
  },
  {
    id: "past_posts",
    source: "Past LinkedIn posts",
    sentence: "💡 Select one or more top posts and we will reuse the core idea with a fresh angle.",
    shortDescription: "Refresh a proven past post.",
    button: "Repurpose posts",
  },
  {
    id: "profile",
    source: "Your LinkedIn profile",
    sentence: "💡 Choose a profile detail and we will turn your experience or credibility into a new post.",
    shortDescription: "Create from your profile.",
    button: "Create from profile",
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

const GOAL_PILLARS: Record<string, string[]> = {
  "Get inbound leads": ["Problem education", "Objection handling", "Proof / case study", "Process / how-I-work"],
  "Build authority": ["Point of view", "Mistakes and misconceptions", "Market / industry observation", "Audience belief shift"],
  "Grow my audience": ["Personal story", "Community / network conversation", "Behind the scenes", "Values / philosophy"],
  "Promote my product/service": ["Product / service education", "Problem education", "Proof / case study", "Objection handling"],
  "Get job opportunities": ["Career / credibility proof", "Process / how-I-work", "Personal story", "Values / philosophy"],
  "Build network": ["Community / network conversation", "Market / industry observation", "Personal story", "Point of view"],
  "Recruit / hire talent": ["Hiring / culture", "Values / philosophy", "Behind the scenes", "Point of view"],
}

const ROLE_PILLAR_BOOSTS: Record<string, string[]> = {
  Founder: ["Point of view", "Behind the scenes", "Product / service education"],
  "Agency owner": ["Proof / case study", "Problem education", "Process / how-I-work"],
  Consultant: ["Problem education", "Audience belief shift", "Objection handling"],
  Freelancer: ["Process / how-I-work", "Proof / case study", "Personal story"],
  Coach: ["Audience belief shift", "Mistakes and misconceptions", "Personal story"],
  Creator: ["Personal story", "Values / philosophy", "Community / network conversation"],
  Marketer: ["Market / industry observation", "Point of view", "Problem education"],
  "Job seeker / career professional": ["Career / credibility proof", "Process / how-I-work", "Personal story"],
}

const uniqueValues = (values: string[]) => values.filter((value, index) => value && values.indexOf(value) === index)

const isOlderThan = (date?: string | Date | null, ttlMs = CONTENT_CONTEXT_STALE_MS) => {
  if (!date) return false
  const value = new Date(date).getTime()
  return Number.isFinite(value) && Date.now() - value > ttlMs
}

const getDashboardPillars = (role?: string, goal?: string) =>
  uniqueValues([...(GOAL_PILLARS[goal || ""] || GOAL_PILLARS["Build authority"]), ...(ROLE_PILLAR_BOOSTS[role || ""] || [])]).slice(0, 4)

const DashboardCard = ({
  title,
  children,
  className = "",
  action,
}: {
  title: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) => (
  <section className={`rounded-[10px] border border-newTableBorder bg-newTableHeader p-[16px] ${className}`}>
    <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-[16px] font-semibold text-newTextColor">{title}</h2>
      {action}
    </div>
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

const RepurposeContentModal = ({
  source,
  topPosts,
  onGenerate,
}: {
  source: RepurposeSourceConfig
  topPosts: RepurposeTopPost[]
  onGenerate: (input: RepurposeGenerateInput) => Promise<void>
}) => {
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [selectedPostLabels, setSelectedPostLabels] = useState<string[]>(topPosts[0]?.label ? [topPosts[0].label] : [])
  const [profileFocus, setProfileFocus] = useState("")
  const [additionalContext, setAdditionalContext] = useState("")
  const [visualContext, setVisualContext] = useState("")
  const [showVisualContext, setShowVisualContext] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const selectedPosts = topPosts.filter((post) => selectedPostLabels.includes(post.label))
  const canGenerate =
    !loading && (source.id === "website" ? !!websiteUrl.trim() : source.id === "past_posts" ? selectedPosts.length > 0 : !!profileFocus.trim())

  const submit = async () => {
    if (!canGenerate) {
      return
    }

    setLoading(true)
    setError("")
    try {
      await onGenerate({
        sourceType: source.id,
        websiteUrl: websiteUrl.trim() || undefined,
        selectedPosts,
        profileFocus: profileFocus.trim() || undefined,
        additionalContext: additionalContext.trim() || undefined,
        visualContext: showVisualContext ? visualContext.trim() || undefined : undefined,
      })
    } catch (err: any) {
      setError(err?.message || "Could not generate a post from this source")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-[14px] text-newTextColor">
      <div className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px] text-[13px] leading-[19px] text-customColor18">
        {source.sentence}
      </div>

      {source.id === "website" && (
        <label className="flex flex-col gap-[7px] text-[13px] font-semibold">
          Website URL
          <input
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            placeholder="https://example.com/service-page"
            className="h-[42px] rounded-[8px] border border-newTableBorder bg-newBgColorInner px-[12px] text-[14px] font-normal outline-none focus:border-[#8b5cf6]"
          />
        </label>
      )}

      {source.id === "past_posts" && (
        <div className="flex flex-col gap-[8px]">
          <div className="text-[13px] font-semibold">Select one or more past posts to repurpose</div>
          {topPosts.length ? (
            topPosts.map((post) => {
              const checked = selectedPostLabels.includes(post.label)
              return (
                <label
                  key={post.label}
                  className={`flex cursor-pointer items-start gap-[10px] rounded-[9px] border p-[10px] ${
                    checked ? "border-[#8b5cf6]/45 bg-[#8b5cf6]/10" : "border-newTableBorder bg-newBgColorInner"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setSelectedPostLabels((current) =>
                        current.includes(post.label) ? current.filter((label) => label !== post.label) : [...current, post.label],
                      )
                    }
                    className="mt-[3px]"
                  />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-[13px] font-semibold leading-[18px]">{post.label}</span>
                    <span className="mt-[4px] block text-[12px] text-customColor18">
                      {post.total ? `${post.total} engagements` : "Top post"}
                      {post.date ? ` · ${post.date}` : ""}
                    </span>
                  </span>
                </label>
              )
            })
          ) : (
            <div className="rounded-[9px] border border-dashed border-newTableBorder bg-newBgColorInner p-[12px] text-[13px] leading-[19px] text-customColor18">
              We do not have enough past-post analytics yet. Add context below or use another source.
            </div>
          )}
        </div>
      )}

      {source.id === "profile" && (
        <label className="flex flex-col gap-[7px] text-[13px] font-semibold">
          What should the post focus on?
          <select
            value={profileFocus}
            onChange={(event) => setProfileFocus(event.target.value)}
            className="h-[42px] rounded-[8px] border border-newTableBorder bg-newBgColorInner px-[12px] text-[14px] font-normal outline-none focus:border-[#8b5cf6]"
          >
            <option value="">Choose a profile angle</option>
            <option value="Current role">Current role</option>
            <option value="Past experience">Past experience</option>
            <option value="Skill or expertise">Skill or expertise</option>
            <option value="Certification or education">Certification or education</option>
            <option value="Career lesson">Career lesson</option>
            <option value="Credibility proof">Credibility proof</option>
          </select>
        </label>
      )}

      <label className="flex flex-col gap-[7px] text-[13px] font-semibold">
        Additional context
        <textarea
          value={additionalContext}
          onChange={(event) => setAdditionalContext(event.target.value)}
          placeholder="Add any angle, audience detail, offer, proof point, or constraint the post should consider."
          rows={4}
          className="resize-none rounded-[8px] border border-newTableBorder bg-newBgColorInner p-[12px] text-[14px] font-normal leading-[20px] outline-none focus:border-[#8b5cf6]"
        />
      </label>

      <div>
        <button type="button" onClick={() => setShowVisualContext((current) => !current)} className="text-[12px] font-semibold text-[#8b5cf6]">
          {showVisualContext ? "Remove optional visual context" : "Add optional visual context"}
        </button>
        {showVisualContext && (
          <textarea
            value={visualContext}
            onChange={(event) => setVisualContext(event.target.value)}
            placeholder="Optional: describe an image, chart, screenshot, or document you may add in the editor."
            rows={3}
            className="mt-[8px] w-full resize-none rounded-[8px] border border-newTableBorder bg-newBgColorInner p-[12px] text-[14px] leading-[20px] outline-none focus:border-[#8b5cf6]"
          />
        )}
      </div>

      {error && <div className="rounded-[8px] border border-[#ef4444]/30 bg-[#ef4444]/10 p-[10px] text-[13px] text-[#ef4444]">{error}</div>}

      <div className="flex justify-end gap-[10px]">
        <button
          type="button"
          disabled={!canGenerate}
          onClick={submit}
          className={`h-[40px] rounded-[8px] px-[14px] text-[13px] font-semibold text-white ${
            canGenerate ? "bg-[#8b5cf6]" : "cursor-not-allowed bg-newTableBorder text-customColor18"
          }`}
        >
          {loading ? "Generating..." : "Generate post"}
        </button>
      </div>
    </div>
  )
}

const LinkedinProfileOptimizerModal = ({
  integrationId,
  picture,
  profileName,
  role,
  audience,
  goal,
}: {
  integrationId: string
  picture?: string
  profileName?: string
  role: string
  audience: string
  goal: string
}) => {
  const fetch = useFetch()
  const toaster = useToaster()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [data, setData] = useState<LinkedinProfileOptimizationResult | null>(null)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch("/user/linkedin-profile-optimizer", {
          method: "POST",
          body: JSON.stringify({
            integrationId,
            role,
            audience,
            goal,
          }),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not analyze your LinkedIn profile")
        }

        const result = (await response.json()) as LinkedinProfileOptimizationResult
        if (active) {
          setData(result)
        }
      } catch (err: any) {
        if (active) {
          setError(err?.message || "Could not analyze your LinkedIn profile")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [audience, fetch, goal, integrationId, role])

  const copyText = async (value: string, label: string) => {
    const text = String(value || "").trim()
    if (!text) {
      toaster.show(`No ${label.toLowerCase()} to copy`, "warning")
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      toaster.show(`${label} copied`, "success")
    } catch {
      toaster.show(`Could not copy ${label.toLowerCase()}`, "warning")
    }
  }

  return (
    <div className="flex flex-col gap-[14px] text-newTextColor">
      <div className="flex items-center gap-[12px] rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px]">
        <img
          src={picture || "/icons/platforms/linkedin.png"}
          alt="LinkedIn profile"
          className="h-[52px] w-[52px] rounded-full border border-newTableBorder object-cover"
        />
        <div>
          <div className="text-[16px] font-semibold">{profileName || "LinkedIn profile"}</div>
          <div className="mt-[4px] text-[13px] leading-[19px] text-customColor18">
            Optimizing your profile can improve conversion from people who visit your LinkedIn profile.
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[14px] text-[13px] text-customColor18">
          Analyzing headline and About section...
        </div>
      )}
      {error && <div className="rounded-[10px] border border-[#ef4444]/30 bg-[#ef4444]/10 p-[12px] text-[13px] text-[#ef4444]">{error}</div>}

      {!loading && !error && data && (
        <>
          <div className="rounded-[10px] border border-newTableBorder bg-newTableHeader p-[12px] text-[12px] leading-[18px] text-customColor18">
            These are suggested edits based on your role, goal, audience, and LinkedIn profile context. Update them directly on LinkedIn if they fit.
          </div>

          <div className="grid gap-[12px] lg:grid-cols-2">
            <section className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px]">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-customColor18">Current headline</div>
              <div className="mt-[8px] text-[15px] font-semibold leading-[22px]">
                {data.currentHeadline || "No headline found in the stored LinkedIn profile data."}
              </div>
            </section>
            <section className="rounded-[10px] border border-[#0a66c2]/25 bg-[#0a66c2]/10 p-[12px]">
              <div className="flex items-start justify-between gap-[10px]">
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#0a66c2]">Suggested headline</div>
                <button
                  type="button"
                  onClick={() => copyText(data.suggestedHeadline, "Headline")}
                  className="rounded-[8px] border border-[#0a66c2]/25 bg-white/70 px-[10px] py-[6px] text-[12px] font-semibold text-[#0a66c2] dark:bg-black/10"
                >
                  Copy
                </button>
              </div>
              <div className="mt-[8px] text-[15px] font-semibold leading-[22px] text-newTextColor">
                {data.suggestedHeadline || "No headline suggestion available."}
              </div>
            </section>
          </div>

          <div className="grid gap-[12px] lg:grid-cols-2">
            <section className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px]">
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-customColor18">Current About</div>
              <div className="mt-[8px] whitespace-pre-wrap text-[14px] leading-[21px]">
                {data.currentAbout || "No About section was found in the stored LinkedIn profile data."}
              </div>
            </section>
            <section className="rounded-[10px] border border-[#22c55e]/25 bg-[#22c55e]/10 p-[12px]">
              <div className="flex items-start justify-between gap-[10px]">
                <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#22c55e]">Suggested About</div>
                <button
                  type="button"
                  onClick={() => copyText(data.suggestedAbout, "About section")}
                  className="rounded-[8px] border border-[#22c55e]/25 bg-white/70 px-[10px] py-[6px] text-[12px] font-semibold text-[#22c55e] dark:bg-black/10"
                >
                  Copy
                </button>
              </div>
              <div className="mt-[8px] whitespace-pre-wrap text-[14px] leading-[21px] text-newTextColor">
                {data.suggestedAbout || "No About section suggestion available."}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

const WeeklyCampaignBuilderModal = ({
  defaultDates,
  availablePillars,
  integrationId,
  role,
  audience,
  goal,
  analyticsHints,
  onCreateFromScratch,
  onGenerate,
}: {
  defaultDates: Date[]
  availablePillars: string[]
  integrationId: string
  role: string
  audience: string
  goal: string
  analyticsHints: WeeklyCampaignAnalyticsHints
  onCreateFromScratch: () => void
  onGenerate: (items: WeeklyCampaignConfirmedItem[]) => Promise<void>
}) => {
  const fetch = useFetch()
  const [postCount, setPostCount] = useState(1)
  const [plans, setPlans] = useState<WeeklyCampaignPlanItem[]>([])
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({})
  const [contextByPlan, setContextByPlan] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [pillarChangeSlot, setPillarChangeSlot] = useState<number | null>(null)

  const plannedDates = useMemo(() => defaultDates.slice(0, postCount), [defaultDates, postCount])

  const loadRecommendations = useCallback(
    async (count = postCount) => {
      if (!integrationId || !role || !audience || !goal) {
        setError("Complete onboarding before creating posts.")
        return
      }

      setLoading(true)
      setError("")
      try {
        const response = await fetch("/user/weekly-campaign/recommendations", {
          method: "POST",
          body: JSON.stringify({
            integrationId,
            role,
            audience,
            goal,
            count,
            analyticsHints,
          }),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not choose templates")
        }

        const data = await response.json()
        const posts = ((data?.posts || []) as WeeklyCampaignPlanItem[]).map((post, index) => ({
          ...post,
          date: plannedDates[index] ? formatDateKey(plannedDates[index]) : post.date,
        }))
        setPlans(posts)
        setAnswers({})
        setContextByPlan({})
      } catch (err: any) {
        setError(err?.message || "Could not choose templates")
      } finally {
        setLoading(false)
      }
    },
    [analyticsHints, audience, fetch, goal, integrationId, plannedDates, postCount, role],
  )

  useEffect(() => {
    loadRecommendations(postCount)
  }, [loadRecommendations, postCount])

  const replaceTemplate = async (plan: WeeklyCampaignPlanItem, pillar?: string) => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/user/weekly-campaign/recommendations", {
        method: "POST",
        body: JSON.stringify({
          integrationId,
          role,
          audience,
          goal,
          count: 1,
          pillar: pillar || plan.pillar,
          usedTemplateIds: plans.filter((item) => item.id !== plan.id).map((item) => item.templateId),
          excludedTemplateIds: [plan.templateId],
          missingFields: plan.questions.flatMap((question) => question.fills || []),
          avoidRequiredProof: plan.proofRequirement === "required",
          analyticsHints,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || "Choose another pillar for this post.")
      }

      const data = await response.json()
      const replacement = data?.posts?.[0] as WeeklyCampaignPlanItem | undefined
      if (!replacement) {
        setPillarChangeSlot(plan.slot)
        return
      }

      setPlans((current) =>
        current.map((item) =>
          item.id === plan.id
            ? {
                ...replacement,
                slot: plan.slot,
                date: plan.date,
                analyticsRecommended: plan.analyticsRecommended,
              }
            : item,
        ),
      )
      setAnswers((current) => {
        const next = { ...current }
        delete next[plan.id]
        return next
      })
      setContextByPlan((current) => {
        const next = { ...current }
        delete next[plan.id]
        return next
      })
      setPillarChangeSlot(null)
    } catch (err: any) {
      setError(err?.message || "Choose another pillar for this post.")
      setPillarChangeSlot(plan.slot)
    } finally {
      setLoading(false)
    }
  }

  const submit = async () => {
    const confirmed = plans.map((plan) => ({
      ...plan,
      useContextFromProfileAndWebsite: !!contextByPlan[plan.id],
      answers: plan.questions.map((question, index) => ({
        ...question,
        answer: (answers[plan.id]?.[index] || "").trim(),
      })),
    }))
    const missing = confirmed.some((plan) => !plan.useContextFromProfileAndWebsite && plan.answers.some((answer) => !answer.answer))
    if (missing) {
      setError("Please fill the requested details for each post, or change the post format.")
      return
    }

    setGenerating(true)
    setError("")
    try {
      await onGenerate(confirmed)
    } catch (err: any) {
      setError(err?.message || "Could not generate posts")
    } finally {
      setGenerating(false)
    }
  }

  const canSubmit = !loading && !generating && plans.length === postCount && plans.length > 0

  return (
    <div className="flex flex-col gap-[18px] text-newTextColor">
      <div className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px] text-[13px] leading-[19px] text-customColor18">
        Choose how many posts you want to create. We’ll assign default draft dates automatically based on open weekdays and your existing LinkedIn
        posts.
      </div>

      <div className="grid gap-[10px] sm:grid-cols-[1fr_180px]">
        <button
          type="button"
          onClick={onCreateFromScratch}
          className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[13px] text-left"
        >
          <div className="text-[14px] font-semibold">Create post from scratch</div>
          <div className="mt-[4px] text-[12px] text-customColor18">Open a blank editor for one post.</div>
        </button>
        <label className="flex flex-col gap-[6px] rounded-[10px] border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-[13px] text-[13px] font-semibold">
          Number of posts
          <input
            type="number"
            min={1}
            max={20}
            value={postCount}
            onChange={(event) => setPostCount(Math.max(1, Math.min(20, Number(event.target.value) || 1)))}
            className="h-[36px] rounded-[8px] border border-newTableBorder bg-newTableHeader px-[10px] text-[14px] outline-none"
          />
        </label>
      </div>

      {error && <div className="rounded-[8px] border border-[#ef4444]/30 bg-[#ef4444]/10 p-[10px] text-[13px] text-[#ef4444]">{error}</div>}
      {loading && (
        <div className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[14px] text-[13px] text-customColor18">
          Choosing templates...
        </div>
      )}

      <div className="flex flex-col gap-[18px]">
        {plans.map((plan, index) => (
          <section key={plan.id} className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[16px]">
            <div className="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-[14px] font-semibold">Post {index + 1}</div>
                <div className="mt-[5px] flex flex-wrap gap-[6px]">
                  <Badge tone="blue">{plan.pillar}</Badge>
                  <Badge tone="gray">{plan.templateName}</Badge>
                  {plan.analyticsRecommended && <Badge tone="green">Recommended from past posts</Badge>}
                  {plan.proofRequirement === "required" && <Badge tone="orange">Needs proof</Badge>}
                </div>
                <div className="mt-[7px] text-[12px] leading-[17px] text-customColor18">{plan.why}</div>
              </div>
              <button
                type="button"
                onClick={() => replaceTemplate(plan)}
                className="rounded-[8px] border border-[#8b5cf6]/40 bg-[#8b5cf6] px-[12px] py-[8px] text-[12px] font-semibold text-white hover:bg-[#7c3aed]"
              >
                Change post format
              </button>
            </div>

            {pillarChangeSlot === plan.slot && (
              <div className="mt-[10px] rounded-[9px] border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-[10px]">
                <div className="text-[12px] font-semibold">No easier format was found for this pillar. Choose another pillar.</div>
                <div className="mt-[8px] flex flex-wrap gap-[6px]">
                  {availablePillars.map((pillar) => (
                    <button
                      key={pillar}
                      type="button"
                      onClick={() => replaceTemplate(plan, pillar)}
                      className="rounded-full border border-newTableBorder bg-newTableHeader px-[9px] py-[5px] text-[12px] font-semibold"
                    >
                      {pillar}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-[16px] flex items-center justify-between gap-[14px] rounded-[10px] border border-newTableBorder bg-newTableHeader p-[12px]">
              <span className="min-w-0 text-[13px] font-semibold leading-[18px]">
                Use context from LinkedIn profile and Website content (if provided)?
              </span>
              <div className={`shrink-0 rounded-[100px] ${contextByPlan[plan.id] ? "" : "[&>div]:!bg-newBgColorInner"}`}>
                <Slider
                  value={contextByPlan[plan.id] ? "on" : "off"}
                  fill={true}
                  onChange={(value) =>
                    setContextByPlan((current) => ({
                      ...current,
                      [plan.id]: value === "on",
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-[16px] grid gap-[14px]">
              {plan.questions.map((question, questionIndex) => (
                <label key={`${plan.id}-${questionIndex}`} className="flex flex-col gap-[8px] text-[13px] font-semibold">
                  <span>
                    {question.question}
                    {contextByPlan[plan.id] && <span className="font-normal text-customColor18"> Optional</span>}
                  </span>
                  <textarea
                    rows={3}
                    value={answers[plan.id]?.[questionIndex] || ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [plan.id]: {
                          ...(current[plan.id] || {}),
                          [questionIndex]: event.target.value,
                        },
                      }))
                    }
                    className="resize-none rounded-[8px] border border-newTableBorder bg-newTableHeader p-[10px] text-[14px] font-normal leading-[20px] outline-none focus:border-[#8b5cf6]"
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-center gap-[10px] border-t border-newTableBorder bg-newTableHeader py-[12px]">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className={`h-[40px] rounded-[8px] px-[14px] text-[13px] font-semibold text-white ${
            canSubmit ? "bg-[#8b5cf6]" : "cursor-not-allowed bg-newTableBorder text-customColor18"
          }`}
        >
          {generating ? "Creating drafts..." : "Create draft posts"}
        </button>
      </div>
    </div>
  )
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

const getAnalyticsItem = (analytics: AnalyticsDataItem[] | undefined, key: string, label?: string) =>
  analytics?.find((row) => row.key === key || (label && row.label === label))

const formatDashboardPatternValue = (value: unknown) => {
  if (typeof value === "undefined" || value === null || value === "") {
    return "Not enough data yet"
  }

  const text = String(value)
  if (text === "Not enough data") {
    return "Not enough data yet"
  }

  if (["image", "text", "article", "document", "video", "multi-image"].includes(text)) {
    return `${text
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")} post`
  }

  return text
}

const getAnalyticsPatternValue = (analytics: AnalyticsDataItem[] | undefined, key: string, label?: string) => {
  const item = getAnalyticsItem(analytics, key, label)
  return formatDashboardPatternValue(item?.total ?? item?.data?.[0]?.label ?? item?.data?.[0]?.date)
}

const pad = (value: number) => String(value).padStart(2, "0")

const formatDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const formatDateLabel = (date: Date) =>
  date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

const endOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

const addDays = (date: Date, days: number) => {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

const getMonday = (date: Date) => {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return startOfDay(addDays(date, diff))
}

const getTargetCampaignStart = () => {
  const today = new Date()
  const monday = getMonday(today)
  const day = today.getDay()
  return day === 0 || day === 5 || day === 6 ? addDays(monday, 7) : monday
}

const getWeekEnd = (weekStart: Date) => endOfDay(addDays(weekStart, 6))

const getCampaignDates = (campaignStart: Date) => {
  const dates: Date[] = []
  let cursor = startOfDay(new Date() > campaignStart ? new Date() : campaignStart)

  while (dates.length < 4) {
    const day = cursor.getDay()
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor))
    }
    cursor = addDays(cursor, 1)
  }

  return dates
}

const getDefaultLinkedinDraftDates = (count: number, existingPosts: CampaignPost[]) => {
  const dates: Date[] = []
  const occupiedDates = new Set(existingPosts.map((post) => (post.publishDate ? formatDateKey(new Date(post.publishDate)) : "")).filter(Boolean))
  let cursor = startOfDay(new Date())

  while (dates.length < count) {
    const day = cursor.getDay()
    const key = formatDateKey(cursor)
    if (day !== 0 && day !== 6 && !occupiedDates.has(key)) {
      dates.push(new Date(cursor))
      occupiedDates.add(key)
    }
    cursor = addDays(cursor, 1)
  }

  return dates
}

const postTypeForPillar = (pillar?: string) => {
  if (!pillar) {
    return "LinkedIn draft"
  }

  const normalized = pillar.toLowerCase()
  if (normalized.includes("proof") || normalized.includes("case")) {
    return "Proof / Case Study"
  }
  if (normalized.includes("product") || normalized.includes("service")) {
    return "Product / Service Education"
  }
  if (normalized.includes("point of view") || normalized.includes("belief") || normalized.includes("market")) {
    return "POV"
  }
  if (normalized.includes("problem") || normalized.includes("mistake") || normalized.includes("objection")) {
    return "Problem Education"
  }

  return pillar
}

const funnelForPillar = (pillar?: string) => {
  const normalized = (pillar || "").toLowerCase()
  if (normalized.includes("product") || normalized.includes("service") || normalized.includes("objection")) {
    return "Conversion"
  }
  if (normalized.includes("proof") || normalized.includes("process") || normalized.includes("career")) {
    return "Trust"
  }
  return "Awareness"
}

const decodeHtmlEntities = (content: string) =>
  content
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")

const postContentToText = (content?: string) =>
  decodeHtmlEntities(
    (content || "")
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
      .replace(/<\s*li[^>]*>/gi, "- ")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

const summarizeContent = (content?: string) => {
  const lines = postContentToText(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

  return {
    topic: lines[0] || "LinkedIn draft",
    hook: lines[1] || lines[0] || "Open the draft to review the hook.",
  }
}

const statusForPost = (post: CampaignPost) => {
  if (post.state === "DRAFT") {
    return "In Draft"
  }
  if (post.state === "QUEUE") {
    return "Scheduled"
  }
  if (post.state === "PUBLISHED") {
    return "Posted"
  }
  return "In Draft"
}

const statusTone = (status: string) => {
  if (status === "Posted") {
    return "green"
  }
  if (status === "Scheduled") {
    return "blue"
  }
  return "gray"
}

const sourceLabelForPost = (post: CampaignPost) => {
  if (post.generationMetadata?.source === ONBOARDING_CAMPAIGN_SOURCE) {
    return "Suggested"
  }

  if (post.generationMetadata?.source) {
    return "Generated"
  }

  return null
}

const isPostInWeek = (post: CampaignPost, weekStart: Date) => {
  if (!post.publishDate) {
    return false
  }

  const publishDate = new Date(post.publishDate)
  return publishDate >= weekStart && publishDate <= getWeekEnd(weekStart)
}

const sortPostsByDate = (posts: CampaignPost[]) =>
  posts.slice(0).sort((a, b) => String(a.publishDate || "").localeCompare(String(b.publishDate || "")))

const sortCampaignPosts = (posts: CampaignPost[]) =>
  posts.slice(0).sort((a, b) => {
    const aSlot = a.generationMetadata?.campaignSlot || 0
    const bSlot = b.generationMetadata?.campaignSlot || 0
    return aSlot - bSlot || String(a.publishDate || "").localeCompare(String(b.publishDate || ""))
  })

const mapPostsForDisplay = (posts: CampaignPost[], fallbackDates: Date[], onboardingGoal: string) =>
  posts.map((post, index) => {
    const metadata = post.generationMetadata || {}
    const summary = summarizeContent(post.content)
    const date = post.publishDate ? new Date(post.publishDate) : fallbackDates[index]

    return {
      day: date ? formatDateLabel(date) : `Post ${index + 1}`,
      type: metadata.postType || postTypeForPillar(metadata.pillar),
      topic: metadata.topic || summary.topic,
      hook: metadata.hookDirection || summary.hook,
      goal: metadata.goal || onboardingGoal || "Build the weekly narrative",
      cta: metadata.ctaStyle || "Review CTA",
      status: statusForPost(post),
      sourceLabel: sourceLabelForPost(post),
      group: post.group,
    }
  })

const normalizedGoalPhrases: Record<string, string> = {
  "Get inbound leads": "generate inbound leads",
  "Build authority": "build authority",
  "Grow my audience": "grow your audience",
  "Promote my product/service": "promote your product or service",
  "Get job opportunities": "create more job opportunities",
  "Build network": "build your network",
  "Recruit / hire talent": "attract the right talent",
}

const narrativeByGoal: Record<string, (audience: string, role: string) => string> = {
  "Get inbound leads": (audience) => `${audience} should understand the problems you solve before they feel ready to ask for help.`,
  "Build authority": (audience, role) =>
    `${audience} should see you as a credible ${role.toLowerCase()} because you share clear opinions, lessons, and patterns from your work.`,
  "Grow my audience": (audience) =>
    `${audience} should keep coming back because your posts make their own problems, decisions, and beliefs easier to understand.`,
  "Promote my product/service": (audience) =>
    `${audience} should see the problem, the cost of ignoring it, and why your approach is a credible way forward.`,
  "Get job opportunities": (audience) => `${audience} should understand the problems you solve, how you think, and where you do your best work.`,
  "Build network": (audience) => `${audience} should have clear reasons to respond, compare notes, and start useful conversations with you.`,
  "Recruit / hire talent": (audience) =>
    `${audience} should understand how you think, what your standards are, and why the right people would want to work with you.`,
}

const getDashboardStrategyCopy = (role?: string, audience?: string, goal?: string) => {
  const resolvedRole = role || "Founder"
  const resolvedAudience = audience || "Founders and operators"
  const normalizedGoal = normalizedGoalPhrases[goal || ""] || "build authority"
  const narrative =
    narrativeByGoal[goal || ""]?.(resolvedAudience, resolvedRole) ||
    `${resolvedAudience} should understand what you believe, what you solve, and why your perspective is worth following.`

  return {
    goalSentence: `Goal: Reach ${resolvedAudience} and ${normalizedGoal}.`,
    narrative: `Core narrative: ${narrative}`,
  }
}

export const LinkedinStrategyDashboard = () => {
  const fetch = useFetch()
  const toaster = useToaster()
  const modal = useModals()
  const user = useUser()
  const [buildingCampaign, setBuildingCampaign] = useState(false)
  const [postView, setPostView] = useState<"suggested" | "all">("all")
  const [nextWeekExpandedOverride, setNextWeekExpandedOverride] = useState<boolean | null>(null)
  const [workspaceSetupRunning, setWorkspaceSetupRunning] = useState(false)
  const [workspaceSetupError, setWorkspaceSetupError] = useState("")
  const [skipWorkspaceSetup, setSkipWorkspaceSetup] = useState(false)
  const [refreshingContentContext, setRefreshingContentContext] = useState(false)
  const today = useMemo(() => new Date(), [])
  const currentWeekStart = useMemo(() => getMonday(today), [today])
  const currentWeekStartKey = useMemo(() => formatDateKey(currentWeekStart), [currentWeekStart])
  const currentWeekDates = useMemo(() => getCampaignDates(currentWeekStart), [currentWeekStart])
  const nextWeekStart = useMemo(() => addDays(currentWeekStart, 7), [currentWeekStart])
  const nextWeekStartKey = useMemo(() => formatDateKey(nextWeekStart), [nextWeekStart])
  const nextWeekDates = useMemo(() => getCampaignDates(nextWeekStart), [nextWeekStart])
  const shouldPreviewNextWeekByDate = today.getDay() === 0 || today.getDay() === 5 || today.getDay() === 6
  const campaignStart = useMemo(() => getTargetCampaignStart(), [])
  const campaignStartKey = useMemo(() => formatDateKey(campaignStart), [campaignStart])
  const campaignQueryStart = useMemo(() => currentWeekStart.toISOString(), [currentWeekStart])
  const campaignQueryEnd = useMemo(() => getWeekEnd(nextWeekStart).toISOString(), [nextWeekStart])

  const loadIntegrations = useCallback(async () => {
    const integrations = (await (await fetch("/integrations/list")).json()).integrations || []
    return integrations
  }, [fetch])

  const {
    data: integrations = [],
    isLoading: integrationsLoading,
    mutate: mutateIntegrations,
  } = useSWR("analytics-list", loadIntegrations, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  })

  const openAddProvider = useAddProvider(() => mutateIntegrations())
  const isFreeAnalyticsLocked = user?.tier?.current === "FREE" && !user?.trialActive
  const activeIntegrations = useMemo(
    () => integrations.filter((integration: any) => !integration.disabled && !integration.inBetweenSteps),
    [integrations],
  )
  const channelLimit = user?.totalChannels || 1
  const freeChannelLimitReached = user?.tier?.current === "FREE" && activeIntegrations.length >= channelLimit

  const linkedinIntegration = useMemo(
    () => integrations.find((integration: any) => integration.identifier === "linkedin" && !integration.inBetweenSteps),
    [integrations],
  )
  const linkedinProfileName = String(linkedinIntegration?.name || "").trim() || "LinkedIn profile"
  const needsWorkspaceSetup =
    !!linkedinIntegration && !!user?.onboardingCompletedAt && linkedinIntegration.onboardingProfileReady === false && !skipWorkspaceSetup
  const linkedinProfileStale = !!linkedinIntegration?.onboardingProfileReady && isOlderThan(linkedinIntegration.linkedinProfileFetchedAt)
  const websiteProfileStale = !!linkedinIntegration?.onboardingWebsiteUrl && isOlderThan(linkedinIntegration.onboardingWebsiteScrapedAt)
  const hasStaleContentContext = linkedinProfileStale || websiteProfileStale
  const staleContextLabels = [linkedinProfileStale ? "LinkedIn profile" : "", websiteProfileStale ? "website" : ""].filter(Boolean)

  const loadAnalytics = useCallback(async () => {
    if (!linkedinIntegration || isFreeAnalyticsLocked || needsWorkspaceSetup) {
      return []
    }
    return (await fetch(`/analytics/${linkedinIntegration.id}?date=${LATEST_LINKEDIN_POSTS_KEY}`)).json()
  }, [fetch, isFreeAnalyticsLocked, linkedinIntegration, needsWorkspaceSetup])

  const { data: analytics = [] } = useSWR(
    linkedinIntegration && !isFreeAnalyticsLocked && !needsWorkspaceSetup
      ? `/analytics-${linkedinIntegration.id}-${LATEST_LINKEDIN_POSTS_KEY}`
      : null,
    loadAnalytics,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  const loadWeeklyPosts = useCallback(async () => {
    const params = new URLSearchParams({
      startDate: campaignQueryStart,
      endDate: campaignQueryEnd,
      customer: "",
    }).toString()

    return expandPosts(await (await fetch(`/posts?${params}`)).json()).posts || []
  }, [campaignQueryEnd, campaignQueryStart, fetch])

  const {
    data: weeklyPosts = [],
    isLoading: weeklyPostsLoading,
    mutate: mutateWeeklyPosts,
  } = useSWR(
    linkedinIntegration && !needsWorkspaceSetup
      ? `/dashboard-weekly-campaign-${linkedinIntegration.id}-${currentWeekStartKey}-${nextWeekStartKey}`
      : null,
    loadWeeklyPosts,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  )

  const getCampaignPostsForWeek = useCallback(
    (weekStart: Date, weekStartKey: string) =>
      sortCampaignPosts(
        (weeklyPosts as CampaignPost[]).filter((post) => {
          const metadata = post.generationMetadata || {}
          const isLinkedinPost = post.integration?.id === linkedinIntegration?.id
          const isWeeklyCampaignPost =
            metadata.source === WEEKLY_CAMPAIGN_SOURCE && (!metadata.campaignWeekStart || metadata.campaignWeekStart === weekStartKey)
          const isOnboardingCampaignPost = metadata.source === ONBOARDING_CAMPAIGN_SOURCE

          return isLinkedinPost && isPostInWeek(post, weekStart) && (isWeeklyCampaignPost || isOnboardingCampaignPost)
        }),
      ),
    [linkedinIntegration?.id, weeklyPosts],
  )

  const getLinkedinPostsForWeek = useCallback(
    (weekStart: Date) =>
      sortPostsByDate(
        (weeklyPosts as CampaignPost[]).filter((post) => post.integration?.id === linkedinIntegration?.id && isPostInWeek(post, weekStart)),
      ),
    [linkedinIntegration?.id, weeklyPosts],
  )

  const currentWeekCampaignPosts = useMemo(
    () => getCampaignPostsForWeek(currentWeekStart, currentWeekStartKey),
    [currentWeekStart, currentWeekStartKey, getCampaignPostsForWeek],
  )

  const nextWeekCampaignPosts = useMemo(
    () => getCampaignPostsForWeek(nextWeekStart, nextWeekStartKey),
    [getCampaignPostsForWeek, nextWeekStart, nextWeekStartKey],
  )

  const targetCampaignPosts = useMemo(
    () => getCampaignPostsForWeek(campaignStart, campaignStartKey),
    [campaignStart, campaignStartKey, getCampaignPostsForWeek],
  )

  const currentWeekLinkedinPosts = useMemo(() => getLinkedinPostsForWeek(currentWeekStart), [currentWeekStart, getLinkedinPostsForWeek])
  const nextWeekLinkedinPosts = useMemo(() => getLinkedinPostsForWeek(nextWeekStart), [getLinkedinPostsForWeek, nextWeekStart])
  const defaultLinkedinDraftDates = useMemo(
    () => getDefaultLinkedinDraftDates(20, [...currentWeekLinkedinPosts, ...nextWeekLinkedinPosts]),
    [currentWeekLinkedinPosts, nextWeekLinkedinPosts],
  )

  const onboardingRole = user?.onboardingPersonaOther || user?.onboardingPersona || ""
  const onboardingAudience = user?.onboardingAudience || ""
  const onboardingGoal = user?.onboardingGoal || ""
  const strategyCopy = useMemo(
    () => getDashboardStrategyCopy(onboardingRole, onboardingAudience, onboardingGoal),
    [onboardingAudience, onboardingGoal, onboardingRole],
  )
  const dashboardPillars = useMemo(() => {
    const postPillars = uniqueValues(
      [...currentWeekCampaignPosts, ...nextWeekCampaignPosts, ...targetCampaignPosts].map((post) => post.generationMetadata?.pillar || ""),
    )
    return uniqueValues([...postPillars, ...getDashboardPillars(onboardingRole, onboardingGoal)]).slice(0, 4)
  }, [currentWeekCampaignPosts, nextWeekCampaignPosts, onboardingGoal, onboardingRole, targetCampaignPosts])
  const setupWorkspace = useCallback(
    async (options?: { refreshLinkedin?: boolean; refreshWebsite?: boolean }) => {
      if (!linkedinIntegration || workspaceSetupRunning) {
        return false
      }

      setWorkspaceSetupRunning(true)
      setWorkspaceSetupError("")
      try {
        const response = await fetch("/user/onboarding/setup-workspace", {
          method: "POST",
          body: JSON.stringify({
            integrationId: linkedinIntegration.id,
            refreshLinkedin: !!options?.refreshLinkedin,
            refreshWebsite: !!options?.refreshWebsite,
          }),
        })

        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not set up your workspace")
        }

        await mutateIntegrations()
        return true
      } catch (error: any) {
        setWorkspaceSetupError(error?.message || "Could not set up your workspace")
        return false
      } finally {
        setWorkspaceSetupRunning(false)
      }
    },
    [fetch, linkedinIntegration, mutateIntegrations, workspaceSetupRunning],
  )

  useEffect(() => {
    if (!needsWorkspaceSetup || workspaceSetupRunning || workspaceSetupError) {
      return
    }

    setupWorkspace()
  }, [needsWorkspaceSetup, setupWorkspace, workspaceSetupError, workspaceSetupRunning])

  const refreshStaleContentContext = useCallback(async () => {
    if (!hasStaleContentContext || refreshingContentContext) {
      return
    }

    setRefreshingContentContext(true)
    try {
      const refreshed = await setupWorkspace({
        refreshLinkedin: linkedinProfileStale,
        refreshWebsite: websiteProfileStale,
      })
      if (refreshed) {
        await mutateIntegrations()
        toaster.show("Workspace context refreshed", "success")
      } else {
        setWorkspaceSetupError("")
        toaster.show("Could not refresh workspace context", "warning")
      }
    } finally {
      setRefreshingContentContext(false)
    }
  }, [hasStaleContentContext, linkedinProfileStale, mutateIntegrations, refreshingContentContext, setupWorkspace, toaster, websiteProfileStale])

  const analyticsSummary = useMemo(() => {
    if (isFreeAnalyticsLocked) {
      return {
        bestTopic: "Upgrade required",
        bestHook: "Upgrade required",
        bestFormat: "Upgrade required",
        bestCta: "Upgrade required",
        totalEngagement: "Locked",
        averageEngagement: "Locked",
        nextAction: "Upgrade to Pro to see what is working from your LinkedIn posts and get analytics-backed content recommendations.",
      }
    }

    const bestTopic = getAnalyticsPatternValue(analytics, "topic_performance", "Best topic / pillar")
    const bestHook = getAnalyticsPatternValue(analytics, "hook_style_performance", "Best hook style")
    const bestFormat = getAnalyticsPatternValue(analytics, "media_type_performance", "Media type performance")
    const bestCta = getAnalyticsPatternValue(analytics, "cta_style_performance", "Best CTA style")
    const nextDecision = getAnalyticsItem(analytics, "next_content_decision", "Your next content decision")
    const hasNextDecision = nextDecision?.recommendation && nextDecision.recommendation !== "Not enough data"
    const hasEnoughPatterns = [bestTopic, bestHook, bestFormat, bestCta].some((value) => value !== "Not enough data yet")

    return {
      bestTopic,
      bestHook,
      bestFormat,
      bestCta,
      totalEngagement: getAnalyticsValue(analytics, "Total engagement"),
      averageEngagement: getAnalyticsValue(analytics, "Average engagement per post"),
      nextAction: hasNextDecision
        ? nextDecision.recommendation!
        : hasEnoughPatterns
        ? `Use the strongest detected pattern for your next post: ${bestTopic} topic, ${bestHook} hook, ${bestFormat} format, and ${bestCta} CTA.`
        : "Connect LinkedIn and publish more posts to unlock a reliable next action.",
    }
  }, [analytics, isFreeAnalyticsLocked])

  const topEngagementPosts = useMemo(
    () =>
      ((analytics as AnalyticsDataItem[]).find((item) => item.label === "Top 10 posts by engagement")?.data || []).slice(0, 4).map((post) => ({
        label: post.label || post.date || "LinkedIn post",
        date: post.date && post.date !== post.label ? post.date : undefined,
        total: post.total,
      })),
    [analytics],
  )

  const openPostEditor = useCallback(
    async (post: Pick<CampaignPost, "group">) => {
      if (!post.group) {
        toaster.show("Could not open this post", "warning")
        return
      }

      try {
        const response = await fetch(`/posts/group/${post.group}`)
        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not open this post")
        }

        const data = await response.json()
        const publishDate = dayjs.utc(data.posts?.[0]?.publishDate || new Date()).local()

        modal.openModal({
          id: "add-edit-modal",
          closeOnClickOutside: false,
          removeLayout: true,
          closeOnEscape: false,
          withCloseButton: false,
          askClose: true,
          fullScreen: true,
          classNames: {
            modal: "w-[100%] max-w-[1400px] text-textColor",
          },
          children: (
            <ExistingDataContextProvider value={data}>
              <AddEditModal
                allIntegrations={integrations.map((integration: any) => ({ ...integration }))}
                reopenModal={() => openPostEditor(post)}
                mutate={mutateWeeklyPosts}
                integrations={integrations
                  .slice(0)
                  .filter((integration: any) => integration.id === data.integration)
                  .map((integration: any) => ({
                    ...integration,
                    picture: data.integrationPicture,
                  }))}
                date={publishDate}
              />
            </ExistingDataContextProvider>
          ),
          size: "80%",
          title: "",
        })
      } catch (error: any) {
        toaster.show(error?.message || "Could not open this post", "warning")
      }
    },
    [fetch, integrations, modal, mutateWeeklyPosts, toaster],
  )

  const openPostEditorById = useCallback(
    async (postId: string) => {
      try {
        const response = await fetch(`/posts/${postId}`)
        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not open this post")
        }

        const data = await response.json()
        const publishDate = dayjs.utc(data.posts?.[0]?.publishDate || new Date()).local()

        modal.closeAll()
        modal.openModal({
          id: "add-edit-modal",
          closeOnClickOutside: false,
          removeLayout: true,
          closeOnEscape: false,
          withCloseButton: false,
          askClose: true,
          fullScreen: true,
          classNames: {
            modal: "w-[100%] max-w-[1400px] text-textColor",
          },
          children: (
            <ExistingDataContextProvider value={data}>
              <AddEditModal
                allIntegrations={integrations.map((integration: any) => ({ ...integration }))}
                reopenModal={() => openPostEditorById(postId)}
                mutate={mutateWeeklyPosts}
                integrations={integrations
                  .slice(0)
                  .filter((integration: any) => integration.id === data.integration)
                  .map((integration: any) => ({
                    ...integration,
                    picture: data.integrationPicture,
                  }))}
                date={publishDate}
              />
            </ExistingDataContextProvider>
          ),
          size: "80%",
          title: "",
        })
      } catch (error: any) {
        toaster.show(error?.message || "Could not open this post", "warning")
      }
    },
    [fetch, integrations, modal, mutateWeeklyPosts, toaster],
  )

  const openBlankPostEditor = useCallback(async () => {
    if (!linkedinIntegration) {
      toaster.show("Connect your personal LinkedIn profile first", "warning")
      return
    }

    const slotResponse = await fetch(`/posts/find-slot/${linkedinIntegration.id}`)
    const slot = slotResponse.ok ? await slotResponse.json() : {}
    const date = slot?.date ? dayjs.utc(slot.date).local() : dayjs().add(10, "minute")

    modal.closeAll()
    modal.openModal({
      id: "add-edit-modal",
      closeOnClickOutside: false,
      removeLayout: true,
      closeOnEscape: false,
      withCloseButton: false,
      askClose: true,
      fullScreen: true,
      classNames: {
        modal: "w-[100%] max-w-[1400px] text-textColor",
      },
      children: (
        <AddEditModal
          allIntegrations={integrations.map((integration: any) => ({
            ...integration,
          }))}
          integrations={integrations.slice(0).map((integration: any) => ({
            ...integration,
          }))}
          selectedChannels={[linkedinIntegration.id]}
          mutate={mutateWeeklyPosts}
          date={date}
          reopenModal={() => openBlankPostEditor()}
        />
      ),
      size: "80%",
      title: "",
    })
  }, [fetch, integrations, linkedinIntegration, modal, mutateWeeklyPosts, toaster])

  const generateWeeklyCampaignFromTemplates = useCallback(
    async (items: WeeklyCampaignConfirmedItem[]) => {
      if (!linkedinIntegration) {
        throw new Error("Connect your personal LinkedIn profile first")
      }

      if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
        throw new Error("Complete onboarding before creating posts")
      }

      setBuildingCampaign(true)
      try {
        const generationResponse = await fetch("/user/weekly-campaign/generate", {
          method: "POST",
          body: JSON.stringify({
            integrationId: linkedinIntegration.id,
            role: onboardingRole,
            audience: onboardingAudience,
            goal: onboardingGoal,
            analyticsHints: {
              bestTopic: String(analyticsSummary.bestTopic),
              bestHook: String(analyticsSummary.bestHook),
              bestFormat: String(analyticsSummary.bestFormat),
              bestCta: String(analyticsSummary.bestCta),
              nextAction: analyticsSummary.nextAction,
            },
            templates: items.map((item) => ({
              templateId: item.templateId,
              pillar: item.pillar,
              slot: item.slot,
              date: item.date,
              analyticsRecommended: !!item.analyticsRecommended,
              useContextFromProfileAndWebsite: !!item.useContextFromProfileAndWebsite,
              answers: item.answers,
            })),
          }),
        })

        if (!generationResponse.ok) {
          const text = await generationResponse.text().catch(() => "")
          throw new Error(text || "Could not generate posts")
        }

        const data = await generationResponse.json()
        const generated = (data?.posts || []) as Array<
          OnboardingSuggestion & {
            slot?: number
            date?: string
            analyticsRecommended?: boolean
          }
        >

        if (!generated.length) {
          throw new Error("Could not generate posts")
        }

        const savedPostIds: string[] = []
        for (const [index, suggestion] of generated.entries()) {
          const plan = items[index]
          const dateKey = suggestion.date || plan?.date || formatDateKey(defaultLinkedinDraftDates[index] || addDays(new Date(), index))
          const recommendedDate = new Date(`${dateKey}T00:00:00`)
          const publishDate = new Date(recommendedDate)
          publishDate.setHours(10, 0, 0, 0)
          const summary = summarizeContent(suggestion.content)
          const postType = postTypeForPillar(suggestion.pillar)
          const funnelStage = funnelForPillar(suggestion.pillar)

          const response = await fetch("/posts", {
            method: "POST",
            body: JSON.stringify({
              type: "draft",
              shortLink: false,
              date: publishDate.toISOString(),
              tags: [],
              posts: [
                {
                  integration: {
                    id: linkedinIntegration.id,
                  },
                  settings: {},
                  generationMetadata: {
                    source: WEEKLY_CAMPAIGN_SOURCE,
                    campaignWeekStart: formatDateKey(getMonday(recommendedDate)),
                    campaignSlot: suggestion.slot || plan?.slot || index + 1,
                    recommendedDate: dateKey,
                    postType,
                    topic: summary.topic,
                    hookDirection: summary.hook,
                    goal: suggestion.goal,
                    audience: suggestion.audience,
                    role: suggestion.role,
                    templateId: suggestion.templateId,
                    templateName: suggestion.templateName,
                    pillar: suggestion.pillar,
                    ctaStyle: suggestion.ctaStyle || null,
                    proofRequirement: suggestion.proofRequirement || null,
                    funnelStage,
                    analyticsRecommended: !!suggestion.analyticsRecommended,
                    statusReason: suggestion.proofRequirement === "required" ? "Needs proof" : "Draft ready",
                    generatedAt: new Date().toISOString(),
                  },
                  value: [
                    {
                      id: "",
                      content: suggestion.content,
                      delay: 0,
                      image: [],
                    },
                  ],
                },
              ],
            }),
          })

          if (!response.ok) {
            const text = await response.text().catch(() => "")
            throw new Error(text || "Could not save one of the draft posts")
          }

          const saved = await response.json()
          if (saved?.[0]?.postId) {
            savedPostIds.push(saved[0].postId)
          }
        }

        await mutateWeeklyPosts()
        toaster.show("Draft posts created", "success")
        if (savedPostIds[0]) {
          await openPostEditorById(savedPostIds[0])
        } else {
          modal.closeAll()
        }
      } finally {
        setBuildingCampaign(false)
      }
    },
    [
      analyticsSummary.bestCta,
      analyticsSummary.bestFormat,
      analyticsSummary.bestHook,
      analyticsSummary.bestTopic,
      analyticsSummary.nextAction,
      defaultLinkedinDraftDates,
      fetch,
      linkedinIntegration,
      modal,
      mutateWeeklyPosts,
      onboardingAudience,
      onboardingGoal,
      onboardingRole,
      openPostEditorById,
      toaster,
    ],
  )

  const openWeeklyCampaignBuilder = useCallback(() => {
    if (!linkedinIntegration) {
      toaster.show("Connect your personal LinkedIn profile first", "warning")
      return
    }

    modal.closeAll()
    modal.openModal({
      closeOnClickOutside: true,
      withCloseButton: true,
      classNames: {
        modal: "w-[100%] max-w-[920px] text-textColor",
      },
      title: "Using a template",
      children: (
        <WeeklyCampaignBuilderModal
          defaultDates={defaultLinkedinDraftDates}
          availablePillars={dashboardPillars}
          integrationId={linkedinIntegration.id}
          role={onboardingRole}
          audience={onboardingAudience}
          goal={onboardingGoal}
          analyticsHints={{
            bestTopic: String(analyticsSummary.bestTopic),
            bestHook: String(analyticsSummary.bestHook),
            bestFormat: String(analyticsSummary.bestFormat),
            bestCta: String(analyticsSummary.bestCta),
            nextAction: analyticsSummary.nextAction,
          }}
          onCreateFromScratch={openBlankPostEditor}
          onGenerate={generateWeeklyCampaignFromTemplates}
        />
      ),
    })
  }, [
    analyticsSummary.bestCta,
    analyticsSummary.bestFormat,
    analyticsSummary.bestHook,
    analyticsSummary.bestTopic,
    analyticsSummary.nextAction,
    dashboardPillars,
    defaultLinkedinDraftDates,
    generateWeeklyCampaignFromTemplates,
    linkedinIntegration,
    modal,
    onboardingAudience,
    onboardingGoal,
    onboardingRole,
    openBlankPostEditor,
    toaster,
  ])

  const buildWeeklyCampaign = useCallback(() => {
    if (buildingCampaign) {
      return
    }

    modal.openModal({
      closeOnClickOutside: true,
      withCloseButton: true,
      classNames: {
        modal: "w-[100%] max-w-[680px] text-textColor",
      },
      title: "Select an option:",
      children: (
        <div className="grid gap-[12px] text-newTextColor sm:grid-cols-2">
          <button
            type="button"
            onClick={openWeeklyCampaignBuilder}
            className="rounded-[12px] border border-[#8b5cf6]/35 bg-[#8b5cf6]/10 p-[16px] text-left"
          >
            <Badge tone="purple">Recommended</Badge>
            <div className="mt-[12px] text-[16px] font-semibold">Using a template</div>
            <div className="mt-[6px] text-[13px] leading-[19px] text-customColor18">
              Choose how many posts to create, then add the details each template needs.
            </div>
          </button>
          <button
            type="button"
            onClick={openBlankPostEditor}
            className="rounded-[12px] border border-newTableBorder bg-newBgColorInner p-[16px] text-left"
          >
            <Badge tone="gray">Blank post</Badge>
            <div className="mt-[12px] text-[16px] font-semibold">Create post from scratch</div>
            <div className="mt-[6px] text-[13px] leading-[19px] text-customColor18">Open the post editor without AI-generated content.</div>
          </button>
        </div>
      ),
    })
  }, [buildingCampaign, modal, openBlankPostEditor, openWeeklyCampaignBuilder])

  const openLinkedinProfileOptimizer = useCallback(() => {
    if (!linkedinIntegration) {
      toaster.show("Connect your personal LinkedIn profile first", "warning")
      return
    }

    if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
      toaster.show("Complete onboarding before optimizing your profile", "warning")
      return
    }

    modal.openModal({
      closeOnClickOutside: true,
      withCloseButton: true,
      classNames: {
        modal: "w-[100%] max-w-[1100px] text-textColor",
      },
      title: "Optimize Your LinkedIn profile",
      children: (
        <LinkedinProfileOptimizerModal
          integrationId={linkedinIntegration.id}
          picture={linkedinIntegration.picture}
          profileName={linkedinProfileName}
          role={onboardingRole}
          audience={onboardingAudience}
          goal={onboardingGoal}
        />
      ),
    })
  }, [linkedinIntegration, modal, onboardingAudience, onboardingGoal, onboardingRole, toaster])

  const deletePost = useCallback(
    async (post: Pick<CampaignPost, "group">) => {
      if (!post.group) {
        toaster.show("Could not delete this post", "warning")
        return
      }

      if (!(await deleteDialog("Are you sure you want to delete this post?"))) {
        return
      }

      try {
        const response = await fetch(`/posts/${post.group}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const text = await response.text().catch(() => "")
          throw new Error(text || "Could not delete this post")
        }

        await mutateWeeklyPosts()
        toaster.show("Post deleted successfully", "success")
      } catch (error: any) {
        toaster.show(error?.message || "Could not delete this post", "warning")
      }
    },
    [fetch, mutateWeeklyPosts, toaster],
  )

  const openPrefilledPostEditor = useCallback(
    async (content: string) => {
      if (!linkedinIntegration) {
        toaster.show("Connect your personal LinkedIn profile first", "warning")
        return
      }

      const slotResponse = await fetch(`/posts/find-slot/${linkedinIntegration.id}`)
      const slot = slotResponse.ok ? await slotResponse.json() : {}
      const date = slot?.date ? dayjs.utc(slot.date).local() : dayjs().add(10, "minute")

      modal.closeAll()
      modal.openModal({
        id: "add-edit-modal",
        closeOnClickOutside: false,
        removeLayout: true,
        closeOnEscape: false,
        withCloseButton: false,
        askClose: true,
        fullScreen: true,
        classNames: {
          modal: "w-[100%] max-w-[1400px] text-textColor",
        },
        children: (
          <AddEditModal
            allIntegrations={integrations.map((integration: any) => ({
              ...integration,
            }))}
            integrations={integrations.slice(0).map((integration: any) => ({
              ...integration,
            }))}
            selectedChannels={[linkedinIntegration.id]}
            mutate={mutateWeeklyPosts}
            date={date}
            reopenModal={() => openPrefilledPostEditor(content)}
            onlyValues={[
              {
                content,
                image: [],
              },
            ]}
          />
        ),
        size: "80%",
        title: "",
      })
    },
    [fetch, integrations, linkedinIntegration, modal, mutateWeeklyPosts, toaster],
  )

  const generateRepurposedPost = useCallback(
    async (input: RepurposeGenerateInput) => {
      if (!linkedinIntegration) {
        throw new Error("Connect your personal LinkedIn profile first")
      }

      if (!onboardingRole || !onboardingAudience || !onboardingGoal) {
        throw new Error("Complete onboarding before repurposing content")
      }

      const response = await fetch("/user/repurpose-post", {
        method: "POST",
        body: JSON.stringify({
          integrationId: linkedinIntegration.id,
          sourceType: input.sourceType,
          role: onboardingRole,
          audience: onboardingAudience,
          goal: onboardingGoal,
          pillars: dashboardPillars,
          websiteUrl: input.websiteUrl,
          selectedPosts: input.selectedPosts,
          profileFocus: input.profileFocus,
          additionalContext: input.additionalContext,
          visualContext: input.visualContext,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        throw new Error(text || "Could not generate a post from this source")
      }

      const data = await response.json()
      if (!data?.content) {
        throw new Error("Could not generate a post from this source")
      }

      await openPrefilledPostEditor(data.content)
    },
    [dashboardPillars, fetch, linkedinIntegration, onboardingAudience, onboardingGoal, onboardingRole, openPrefilledPostEditor],
  )

  const openRepurposeModal = useCallback(
    (source: RepurposeSourceConfig) => {
      modal.openModal({
        closeOnClickOutside: true,
        withCloseButton: true,
        classNames: {
          modal: "w-[100%] max-w-[720px] text-textColor",
        },
        title: `Repurpose from ${source.source}`,
        children: <RepurposeContentModal source={source} topPosts={topEngagementPosts} onGenerate={generateRepurposedPost} />,
      })
    },
    [generateRepurposedPost, modal, topEngagementPosts],
  )

  const thisWeekVisiblePosts = postView === "all" ? currentWeekLinkedinPosts : currentWeekCampaignPosts
  const nextWeekVisiblePosts = postView === "all" ? nextWeekLinkedinPosts : nextWeekCampaignPosts
  const hasThisWeekVisiblePosts = thisWeekVisiblePosts.length > 0
  const hasNextWeekVisiblePosts = nextWeekVisiblePosts.length > 0
  const hasRemainingThisWeekPosts = thisWeekVisiblePosts.some((post) => post.publishDate && new Date(post.publishDate) >= today)
  const shouldShowNextWeekPreview = shouldPreviewNextWeekByDate || hasNextWeekVisiblePosts || campaignStartKey === nextWeekStartKey
  const shouldAutoExpandNextWeek = today.getDay() === 0 || !hasRemainingThisWeekPosts
  const isNextWeekExpanded = nextWeekExpandedOverride ?? shouldAutoExpandNextWeek

  const displayedThisWeekPosts = useMemo(
    () => mapPostsForDisplay(thisWeekVisiblePosts, currentWeekDates, onboardingGoal),
    [currentWeekDates, onboardingGoal, thisWeekVisiblePosts],
  )

  const displayedNextWeekPosts = useMemo(
    () => mapPostsForDisplay(nextWeekVisiblePosts, nextWeekDates, onboardingGoal),
    [nextWeekDates, nextWeekVisiblePosts, onboardingGoal],
  )

  const renderPostRows = (posts: Array<ReturnType<typeof mapPostsForDisplay>[number]>) => (
    <div className="mt-[12px] flex flex-col gap-[8px]">
      {posts.map((post) => (
        <article
          key={post.group || `${post.day}-${post.type}-${post.topic}`}
          role="button"
          tabIndex={0}
          onClick={() => openPostEditor(post)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              openPostEditor(post)
            }
          }}
          className="cursor-pointer rounded-[10px] border border-newTableBorder bg-newTableHeader p-[14px] transition-colors hover:border-[#8b5cf6]/35 hover:bg-newTableHeader/80"
        >
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
              {post.sourceLabel && <Badge tone={post.sourceLabel === "Suggested" ? "orange" : "purple"}>{post.sourceLabel}</Badge>}
              <Badge tone={statusTone(post.status)}>{post.status}</Badge>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  deletePost(post)
                }}
                className="inline-flex items-center gap-[5px] rounded-[8px] border border-[#ef4444]/40 bg-[#ef4444]/10 px-[10px] py-[6px] text-[12px] font-semibold text-[#ef4444]"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  )

  if (integrationsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-newBgColorInner">
        <LoadingComponent />
      </div>
    )
  }

  if (needsWorkspaceSetup) {
    return (
      <div className="flex flex-1 flex-col overflow-auto bg-newBgColorInner p-[18px] text-newTextColor">
        <div className="mx-auto flex min-h-[calc(100dvh-120px)] w-full max-w-[920px] items-center justify-center">
          <section className="w-full rounded-[16px] border border-newTableBorder bg-newTableHeader p-[24px] text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
              {workspaceSetupRunning ? (
                <span className="h-[22px] w-[22px] animate-spin rounded-full border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6]" />
              ) : (
                "in"
              )}
            </div>
            <h1 className="mt-[18px] text-[26px] font-semibold leading-[32px]">Setting up your workspace</h1>
            <p className="mx-auto mt-[10px] max-w-[620px] text-[14px] leading-[21px] text-customColor18">
              We’re refreshing your LinkedIn profile context and restoring your content strategy from your completed onboarding setup.
            </p>

            {workspaceSetupError && (
              <div className="mx-auto mt-[16px] max-w-[620px] rounded-[12px] border border-[#ef4444]/30 bg-[#ef4444]/10 p-[13px] text-[13px] leading-[19px] text-newTextColor">
                {workspaceSetupError}
              </div>
            )}

            <div className="mt-[20px] flex flex-col items-center justify-center gap-[10px] sm:flex-row">
              {workspaceSetupError ? (
                <>
                  <button
                    type="button"
                    onClick={() => setupWorkspace()}
                    className="inline-flex h-[42px] items-center justify-center rounded-[9px] bg-[#8b5cf6] px-[16px] text-[14px] font-semibold text-white disabled:opacity-60"
                    disabled={workspaceSetupRunning}
                  >
                    Retry setup
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkipWorkspaceSetup(true)}
                    className="inline-flex h-[42px] items-center justify-center rounded-[9px] border border-newTableBorder bg-newBgColorInner px-[16px] text-[14px] font-semibold text-newTextColor"
                  >
                    Continue with limited dashboard
                  </button>
                </>
              ) : (
                <div className="text-[13px] font-medium text-customColor18">This usually takes a few seconds.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    )
  }

  if (!linkedinIntegration) {
    const hasAnyConnectedChannel = activeIntegrations.length > 0
    const canConnectLinkedin = !freeChannelLimitReached

    return (
      <div className="flex flex-1 flex-col overflow-auto bg-newBgColorInner p-[18px] text-newTextColor">
        <div className="mx-auto flex min-h-[calc(100dvh-120px)] w-full max-w-[920px] items-center justify-center">
          <section className="w-full rounded-[16px] border border-newTableBorder bg-newTableHeader p-[24px] text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <div className="mx-auto flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#0a66c2]/10 text-[#0a66c2]">in</div>
            <h1 className="mt-[18px] text-[26px] font-semibold leading-[32px]">Connect LinkedIn to build your dashboard</h1>
            <p className="mx-auto mt-[10px] max-w-[620px] text-[14px] leading-[21px] text-customColor18">
              Your dashboard strategy, suggested posts, repurposing ideas, and “what’s working” insights are based on a connected personal LinkedIn
              profile.
            </p>
            {hasAnyConnectedChannel && freeChannelLimitReached && (
              <div className="mx-auto mt-[16px] max-w-[620px] rounded-[12px] border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-[13px] text-[13px] leading-[19px] text-newTextColor">
                Your free plan already has its allowed channel connected. You can keep it, but you’ll need to disconnect a channel or upgrade before
                adding LinkedIn.
              </div>
            )}
            <div className="mt-[20px] flex flex-col items-center justify-center gap-[10px] sm:flex-row">
              {canConnectLinkedin ? (
                <button
                  type="button"
                  onClick={openAddProvider}
                  className="inline-flex h-[42px] items-center justify-center rounded-[9px] bg-[#8b5cf6] px-[16px] text-[14px] font-semibold text-white"
                >
                  Connect LinkedIn
                </button>
              ) : (
                <a
                  href="/billing"
                  className="inline-flex h-[42px] items-center justify-center rounded-[9px] bg-[#8b5cf6] px-[16px] text-[14px] font-semibold text-white"
                >
                  Upgrade to add LinkedIn
                </a>
              )}
              {hasAnyConnectedChannel && (
                <a
                  href="/calendar"
                  className="inline-flex h-[42px] items-center justify-center rounded-[9px] border border-newTableBorder bg-newBgColorInner px-[16px] text-[14px] font-semibold text-newTextColor"
                >
                  Manage existing channels
                </a>
              )}
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-newBgColorInner p-[18px] text-newTextColor">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-[16px]">
        <section className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-[820px]">
              <h1 className="mt-[6px] text-[28px] font-semibold leading-[34px]">{strategyCopy.goalSentence}</h1>
              <p className="mt-[8px] text-[14px] italic leading-[21px] text-customColor18">{strategyCopy.narrative}</p>
              <div className="mt-[14px] flex flex-wrap gap-[8px]">
                {dashboardPillars.map((pillar, index) => (
                  <Badge key={pillar} tone={index === 0 ? "purple" : index === 1 ? "blue" : index === 2 ? "green" : "orange"}>
                    {pillar}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="w-full rounded-[10px] bg-newBgColorInner p-[12px] lg:w-[340px]">
              <button
                type="button"
                disabled={buildingCampaign}
                onClick={buildWeeklyCampaign}
                className={`h-[44px] w-full rounded-[10px] px-[16px] text-[14px] font-semibold text-white ${
                  !buildingCampaign ? "bg-gradient-to-r from-[#622aff] to-[#8b5cf6]" : "cursor-not-allowed bg-newTableBorder text-customColor18"
                }`}
              >
                {buildingCampaign ? "Creating drafts..." : "Create LinkedIn Post(s)"}
              </button>
            </div>
          </div>
        </section>

        {hasStaleContentContext && (
          <section className="flex flex-col gap-[12px] rounded-[12px] border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-[14px] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[14px] font-semibold text-newTextColor">Refresh your workspace context</div>
              <p className="mt-[4px] text-[13px] leading-[19px] text-customColor18">
                Your {staleContextLabels.join(" and ")} data is more than 15 days old. Refresh it so FeedVector can keep your strategy and post ideas
                current.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshStaleContentContext}
              disabled={refreshingContentContext || workspaceSetupRunning}
              className="inline-flex h-[40px] shrink-0 items-center justify-center rounded-[9px] border border-[#f59e0b]/40 bg-newTableHeader px-[14px] text-[13px] font-semibold text-newTextColor disabled:opacity-60"
            >
              {refreshingContentContext || workspaceSetupRunning ? "Refreshing..." : "Refresh outdated data"}
            </button>
          </section>
        )}

        <div className="grid gap-[16px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <DashboardCard
            title="✨ This week's posts"
            className="border-[#8b5cf6]/25 bg-newBgColorInner shadow-[inset_0_0_0_1px_rgba(139,92,246,0.08)]"
            action={
              <div
                className="inline-flex w-fit items-center rounded-full border border-newTableBorder bg-newTableHeader p-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                role="group"
                aria-label="Post list filter"
              >
                {[
                  ["suggested", "Suggested posts"],
                  ["all", "All posts"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={postView === value}
                    onClick={() => setPostView(value as "suggested" | "all")}
                    className={`relative min-w-[112px] rounded-full px-[13px] py-[7px] text-[12px] font-semibold transition-all ${
                      postView === value
                        ? "bg-[#8b5cf6] text-white shadow-[0_6px_16px_rgba(139,92,246,0.28)]"
                        : "bg-newBgColorInner text-customColor18 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] hover:bg-newTableBorder hover:text-newTextColor"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          >
            {weeklyPostsLoading && <div className="mt-[10px] text-[12px] text-customColor18">Checking existing posts...</div>}
            <div className="mt-[12px] max-h-[680px] overflow-y-auto rounded-[12px] border border-newTableBorder bg-newBgColorInner p-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              {hasThisWeekVisiblePosts ? (
                renderPostRows(displayedThisWeekPosts)
              ) : (
                <div className="rounded-[10px] border border-dashed border-newTableBorder bg-newTableHeader p-[18px]">
                  <div className="text-[15px] font-semibold">
                    {postView === "all" ? "No LinkedIn posts this week" : "No suggested posts this week"}
                  </div>
                  <div className="mt-[6px] max-w-[620px] text-[13px] leading-[19px] text-customColor18">
                    {postView === "all"
                      ? "Draft, schedule, or generate LinkedIn posts to see them here."
                      : "Use “Create LinkedIn Post(s)” above to create drafts from scratch or templates."}
                  </div>
                </div>
              )}
              {shouldShowNextWeekPreview && (
                <div className="mt-[18px] border-t border-newTableBorder pt-[16px]">
                  <div className="flex flex-col gap-[10px] rounded-[10px] border border-newTableBorder bg-newTableHeader px-[12px] py-[10px] sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => setNextWeekExpandedOverride((current) => !(current ?? shouldAutoExpandNextWeek))}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-newTextColor">Next week's posts</div>
                        <div className="mt-[3px] text-[12px] font-semibold text-customColor18">
                          Starts {formatDateLabel(nextWeekStart)}
                          {hasNextWeekVisiblePosts ? ` · ${nextWeekVisiblePosts.length} ${nextWeekVisiblePosts.length === 1 ? "post" : "posts"}` : ""}
                        </div>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-[8px]">
                      <button
                        type="button"
                        onClick={() => setNextWeekExpandedOverride((current) => !(current ?? shouldAutoExpandNextWeek))}
                        className="flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-newTableBorder"
                        aria-label={isNextWeekExpanded ? "Collapse next week's posts" : "Expand next week's posts"}
                      >
                        <ChevronDownIcon size={18} rotated={isNextWeekExpanded} className="text-customColor18" />
                      </button>
                    </div>
                  </div>
                  {isNextWeekExpanded &&
                    (hasNextWeekVisiblePosts ? (
                      renderPostRows(displayedNextWeekPosts)
                    ) : (
                      <div className="mt-[12px] rounded-[10px] border border-dashed border-newTableBorder bg-newTableHeader p-[16px]">
                        <div className="text-[14px] font-semibold">
                          {postView === "all" ? "No LinkedIn posts for next week" : "No suggested posts for next week yet"}
                        </div>
                        <div className="mt-[5px] max-w-[620px] text-[13px] leading-[19px] text-customColor18">
                          {postView === "all"
                            ? "Any next-week drafts or scheduled LinkedIn posts will show here."
                            : `Use “Create LinkedIn Post(s)” above to create drafts from scratch or templates.`}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </DashboardCard>

          <div className="flex flex-col gap-[16px]">
            {linkedinIntegration && (
              <DashboardCard title="Optimize Your LinkedIn profile">
                <div className="mt-[12px] rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <img
                      src={linkedinIntegration.picture || "/icons/platforms/linkedin.png"}
                      alt="LinkedIn profile"
                      className="h-[52px] w-[52px] rounded-full border border-newTableBorder object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-newTextColor">{linkedinProfileName}</div>
                      <div className="mt-[4px] text-[13px] leading-[19px] text-customColor18">
                        Optimizing profile will lead to higher conversion among users who visit your LinkedIn profile.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openLinkedinProfileOptimizer}
                    className="mt-[14px] inline-flex h-[40px] w-full items-center justify-center rounded-[9px] bg-[#0a66c2] px-[14px] text-[13px] font-semibold text-white"
                  >
                    Optimize LinkedIn profile
                  </button>
                </div>
              </DashboardCard>
            )}

            <DashboardCard title="Repurpose Content">
              <div className="mt-[12px] flex flex-col gap-[10px]">
                {repurposeSources.map((item) => (
                  <div key={item.id} className="rounded-[10px] border border-newTableBorder bg-newBgColorInner p-[12px]">
                    <div className="flex items-center justify-between gap-[10px]">
                      <Badge tone="gray">{item.source}</Badge>
                      <button
                        type="button"
                        onClick={() => openRepurposeModal(item)}
                        className="shrink-0 rounded-[7px] border border-[#8b5cf6]/30 px-[9px] py-[5px] text-[12px] font-semibold text-[#8b5cf6] hover:bg-[#8b5cf6]/10"
                      >
                        {item.button}
                      </button>
                    </div>
                    <div className="mt-[8px] pl-3 text-[9px] leading-[19px] text-black dark:text-white">{item.shortDescription}</div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* <DashboardCard title="⚠️ Needs attention">
              <div className="mt-[12px] flex flex-col gap-[10px]">
                {inputItems.slice(0, 2).map((item) => (
                  <div key={item.missing} className="rounded-[10px] bg-newBgColorInner p-[12px]">
                    <div className="text-[13px] font-semibold">{item.missing}</div>
                    <div className="mt-[5px] text-[12px] leading-[18px] text-customColor18">{item.fix}</div>
                  </div>
                ))}
                <div className="text-center text-[10px] my-10">No items.</div>
              </div>
            </DashboardCard> */}
          </div>
        </div>

        <DashboardCard title="What's working so far" className="p-[18px]">
          <div className="mt-[16px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
            {[
              ["Best topic", analyticsSummary.bestTopic, "Subject area to repeat", "text-[#8b5cf6]", "bg-[#8b5cf6]/10"],
              ["Best hook", analyticsSummary.bestHook, "Opening style to use", "text-[#8b5cf6]", "bg-[#8b5cf6]/10"],
              ["Best format", analyticsSummary.bestFormat, "Post format to favor", "text-[#0a66c2]", "bg-[#0a66c2]/10"],
              ["Best CTA", analyticsSummary.bestCta, "Closing style to test", "text-[#f59e0b]", "bg-[#f59e0b]/10"],
              ["Engagement", analyticsSummary.totalEngagement, "Total recent signal", "text-[#22c55e]", "bg-[#22c55e]/10"],
              ["Avg/post", analyticsSummary.averageEngagement, "Baseline per post", "text-[#22c55e]", "bg-[#22c55e]/10"],
            ].map(([label, value, helper, accentText, accentBg]) => (
              <div key={label} className="min-h-[118px] rounded-[12px] border border-newTableBorder bg-newBgColorInner p-[14px]">
                <div
                  className={`inline-flex rounded-full px-[8px] py-[3px] text-[11px] font-semibold uppercase tracking-[0.08em] ${accentText} ${accentBg}`}
                >
                  {label}
                </div>
                <div className={`mt-[12px] line-clamp-2 text-[16px] font-semibold leading-[22px] ${accentText}`}>{value}</div>
                <div className="mt-[8px] text-[12px] leading-[17px] text-customColor18">{helper}</div>
              </div>
            ))}
          </div>
          <div className="mt-[14px] flex flex-col gap-[6px] rounded-[12px] border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 p-[13px] text-[13px] leading-[19px] text-newTextColor text-center">
            <div className="font-semibold text-[#8b5cf6]">💡 Remember this for your next post:</div>
            <div>{analyticsSummary.nextAction}</div>
          </div>
        </DashboardCard>

        {/* <DashboardCard title="Voice and positioning">
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
          </DashboardCard> */}

        <section className="flex flex-col gap-[12px] rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px] py-[40px] text-center">
          <div>
            <div className="text-[16px] font-semibold text-newTextColor">Want to view full analytics?</div>
            <div className="mt-[4px] text-[13px] text-customColor18">
              Open the detailed analytics page for trends, top posts, and performance breakdowns.
            </div>
          </div>
          <a
            href="/analytics"
            className="inline-flex h-[40px] w-fit shrink-0 items-center justify-center self-center rounded-[8px] bg-[#8b5cf6] px-[14px] text-[13px] font-semibold text-white"
          >
            View analytics
          </a>
        </section>
      </div>
    </div>
  )
}
