"use client"

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import useSWR, { useSWRConfig } from "swr"
import clsx from "clsx"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useToaster } from "@gitroom/react/toaster/toaster"
import { useFireEvents } from "@gitroom/helpers/utils/use.fire.events"
import dayjs from "dayjs"
import { IntegrationContext } from "@gitroom/frontend/components/launches/helpers/use.integration"
import { LinkedinPreview } from "@gitroom/frontend/components/new-launch/providers/linkedin/linkedin.preview"
import { TrashIcon } from "@gitroom/frontend/components/ui/icons"

interface OnboardingModalProps {
  onClose: () => void
}

const roleOptions = ["Founder", "Agency owner", "Consultant", "Freelancer", "Coach", "Creator", "Marketer", "Job seeker / career professional"]
const audienceOptions = [
  "Founders",
  "Business owners",
  "Marketers",
  "Sales professionals",
  "Recruiters / hiring managers",
  "Developers / technical people",
  "Creators",
  "Consultants / freelancers",
  "Potential clients",
  "Industry peers",
]
const goalOptions = [
  "Get inbound leads",
  "Build authority",
  "Grow my audience",
  "Promote my product/service",
  "Get job opportunities",
  "Build network",
  "Recruit / hire talent",
]
const websiteUrlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d{2,5})?(\/[^\s]*)?$/i
const onboardingSuggestionsStorageKey = "feedvector:onboarding:suggestions:v1"
const onboardingSuggestionsTtlMs = 24 * 60 * 60 * 1000
const onboardingLoadingMinimumMs = 20 * 1000

type OnboardingStep = "channels" | "positioning" | "website" | "loading" | "suggestions"

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

type ReviewedSuggestion = {
  templateId: string
  pillar: string
  content: string
  action: "ignored" | "draft" | "schedule" | "now"
}

type OnboardingSuggestionsCache = {
  version: 1
  integrationId: string
  role: string
  audience: string
  goal: string
  websiteUrl: string
  suggestions: OnboardingSuggestion[]
  reviewedSuggestions: ReviewedSuggestion[]
  currentIndex: number
  editedContent: Record<string, string>
  createdAt: string
}

const readSuggestionsCache = (): OnboardingSuggestionsCache | undefined => {
  if (typeof window === "undefined") {
    return undefined
  }

  try {
    const raw = window.localStorage.getItem(onboardingSuggestionsStorageKey)
    if (!raw) {
      return undefined
    }

    const cache = JSON.parse(raw) as OnboardingSuggestionsCache
    if (cache.version !== 1 || !cache.createdAt || Date.now() - new Date(cache.createdAt).getTime() > onboardingSuggestionsTtlMs) {
      window.localStorage.removeItem(onboardingSuggestionsStorageKey)
      return undefined
    }

    return cache
  } catch {
    window.localStorage.removeItem(onboardingSuggestionsStorageKey)
    return undefined
  }
}

const writeSuggestionsCache = (cache: OnboardingSuggestionsCache) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(onboardingSuggestionsStorageKey, JSON.stringify(cache))
}

const clearSuggestionsCache = () => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.removeItem(onboardingSuggestionsStorageKey)
}

const padDatePart = (value: number) => String(value).padStart(2, "0")

const formatDateKey = (date: Date) => `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`

const startOfDay = (date: Date) => {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
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

export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const fetch = useFetch()
  const router = useRouter()
  const toaster = useToaster()
  const { mutate } = useSWRConfig()
  const [step, setStep] = useState<OnboardingStep>("channels")
  const [role, setRole] = useState("")
  const [audience, setAudience] = useState("")
  const [goal, setGoal] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [suggestions, setSuggestions] = useState<OnboardingSuggestion[]>([])
  const [reviewedSuggestions, setReviewedSuggestions] = useState<ReviewedSuggestion[]>([])
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})

  const loadIntegrations = useCallback(async (path: string) => {
    const list = (await (await fetch(path)).json()).integrations
    return list
  }, [])

  const { data: integrations = [] } = useSWR("/integrations/list", loadIntegrations, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: true,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    fallbackData: [],
  })

  const connectedLinkedIn = useMemo(() => {
    return integrations.find((integration: any) => integration.identifier === "linkedin" && !integration.inBetweenSteps)
  }, [integrations])

  useEffect(() => {
    if (connectedLinkedIn && step === "channels") {
      setStep("positioning")
    }
  }, [connectedLinkedIn, step])

  const cacheIdentity = useMemo(() => {
    return {
      integrationId: connectedLinkedIn?.id || "",
      role: role.trim(),
      audience: audience.trim(),
      goal: goal.trim(),
      websiteUrl: websiteUrl.trim(),
    }
  }, [audience, connectedLinkedIn?.id, goal, role, websiteUrl])

  const cacheMatchesInputs = useCallback(
    (cache?: OnboardingSuggestionsCache) => {
      return (
        !!cache &&
        cache.integrationId === cacheIdentity.integrationId &&
        cache.role === cacheIdentity.role &&
        cache.audience === cacheIdentity.audience &&
        cache.goal === cacheIdentity.goal &&
        cache.websiteUrl === cacheIdentity.websiteUrl &&
        cache.suggestions?.length >= 4
      )
    },
    [cacheIdentity],
  )

  useEffect(() => {
    if (!cacheIdentity.integrationId) {
      return
    }

    const cache = readSuggestionsCache()
    if (!cache || cache.integrationId !== cacheIdentity.integrationId || cache.suggestions?.length < 4) {
      return
    }

    const hasCurrentInputs = !!cacheIdentity.role || !!cacheIdentity.audience || !!cacheIdentity.goal || !!cacheIdentity.websiteUrl

    if (hasCurrentInputs && !cacheMatchesInputs(cache)) {
      return
    }

    setRole(cache.role)
    setAudience(cache.audience)
    setGoal(cache.goal)
    setWebsiteUrl(cache.websiteUrl)
    setSuggestions(cache.suggestions)
    setReviewedSuggestions(cache.reviewedSuggestions || [])
    setEditedContent(cache.editedContent || {})
    setSuggestionIndex(Math.min(cache.currentIndex || 0, Math.max(0, cache.suggestions.length - 1)))
    setStep("suggestions")
  }, [cacheIdentity, cacheMatchesInputs])

  const generateSuggestions = useCallback(async () => {
    const loadingStartedAt = Date.now()
    const waitForMinimumLoading = async () => {
      const remainingMs = onboardingLoadingMinimumMs - (Date.now() - loadingStartedAt)
      if (remainingMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingMs))
      }
    }

    if (!connectedLinkedIn) {
      toaster.show("Connect your personal LinkedIn account first", "warning")
      setStep("channels")
      return false
    }

    const cache = readSuggestionsCache()
    if (cacheMatchesInputs(cache)) {
      setSuggestions(cache!.suggestions)
      setReviewedSuggestions(cache!.reviewedSuggestions || [])
      setEditedContent(cache!.editedContent || {})
      setSuggestionIndex(Math.min(cache!.currentIndex || 0, Math.max(0, cache!.suggestions.length - 1)))
      await waitForMinimumLoading()
      setStep("suggestions")
      return true
    }

    const response = await fetch("/user/onboarding/suggestions", {
      method: "POST",
      body: JSON.stringify({
        integrationId: connectedLinkedIn.id,
        role: role.trim(),
        audience: audience.trim(),
        goal: goal.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      toaster.show(text || "Could not create onboarding posts", "warning")
      setStep("website")
      return false
    }

    const data = await response.json()
    const nextSuggestions = data.suggestions || []
    setSuggestions(nextSuggestions)
    setReviewedSuggestions([])
    setEditedContent({})
    setSuggestionIndex(0)
    writeSuggestionsCache({
      version: 1,
      ...cacheIdentity,
      suggestions: nextSuggestions,
      reviewedSuggestions: [],
      currentIndex: 0,
      editedContent: {},
      createdAt: new Date().toISOString(),
    })
    await waitForMinimumLoading()
    setStep("suggestions")
    return true
  }, [cacheIdentity, cacheMatchesInputs, connectedLinkedIn, fetch, toaster, websiteUrl])

  const completeOnboarding = useCallback(
    async (reviewed: ReviewedSuggestion[]) => {
      if (!connectedLinkedIn) {
        toaster.show("Connect your personal LinkedIn account first", "warning")
        setStep("channels")
        return false
      }

      const response = await fetch("/user/onboarding", {
        method: "POST",
        body: JSON.stringify({
          integrationId: connectedLinkedIn.id,
          role: role.trim(),
          audience: audience.trim(),
          goal: goal.trim(),
          reviewedSuggestions: reviewed,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        toaster.show(text || "Could not complete onboarding", "warning")
        setStep("suggestions")
        return false
      }

      await mutate("/user/self")
      clearSuggestionsCache()
      onClose()
      router.push("/dashboard")
      return true
    },
    [audience, connectedLinkedIn, fetch, goal, mutate, onClose, role, router, toaster],
  )

  const reviewSuggestion = useCallback(
    async (action: ReviewedSuggestion["action"], content: string, scheduleDate?: string) => {
      const suggestion = suggestions[suggestionIndex]
      if (!suggestion || !connectedLinkedIn) {
        return
      }

      if (action !== "ignored") {
        const postDate = action === "schedule" && scheduleDate ? new Date(scheduleDate) : new Date()
        const campaignStart = getMonday(postDate)
        const response = await fetch("/posts", {
          method: "POST",
          body: JSON.stringify({
            type: action === "now" ? "now" : action,
            shortLink: false,
            date: postDate.toISOString(),
            tags: [],
            posts: [
              {
                integration: {
                  id: connectedLinkedIn.id,
                },
                settings: {},
                generationMetadata: {
                  source: "onboarding",
                  campaignWeekStart: formatDateKey(campaignStart),
                  campaignSlot: suggestionIndex + 1,
                  recommendedDate: formatDateKey(postDate),
                  templateId: suggestion.templateId,
                  templateName: suggestion.templateName,
                  pillar: suggestion.pillar,
                  role: suggestion.role,
                  goal: suggestion.goal,
                  audience: suggestion.audience,
                  ctaStyle: suggestion.ctaStyle || null,
                  proofRequirement: suggestion.proofRequirement || null,
                  generatedAt: new Date().toISOString(),
                },
                value: [
                  {
                    id: "",
                    content,
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
          toaster.show(text || "Could not save this post", "warning")
          return
        }
      }

      const nextReviewed = [
        ...reviewedSuggestions,
        {
          templateId: suggestion.templateId,
          pillar: suggestion.pillar,
          content,
          action,
        },
      ]
      setReviewedSuggestions(nextReviewed)
      const nextIndex = suggestionIndex + 1 >= suggestions.length ? suggestionIndex : suggestionIndex + 1
      writeSuggestionsCache({
        version: 1,
        ...cacheIdentity,
        suggestions,
        reviewedSuggestions: nextReviewed,
        currentIndex: nextIndex,
        editedContent: {
          ...editedContent,
          [suggestion.id]: content,
        },
        createdAt: readSuggestionsCache()?.createdAt || new Date().toISOString(),
      })

      if (suggestionIndex + 1 >= suggestions.length) {
        await completeOnboarding(nextReviewed)
        return
      }

      setSuggestionIndex((index) => index + 1)
    },
    [completeOnboarding, connectedLinkedIn, cacheIdentity, editedContent, fetch, reviewedSuggestions, suggestionIndex, suggestions, toaster],
  )

  return (
    <div className="w-full min-h-full flex-1 p-4 sm:p-6 md:p-10 flex relative justify-center">
      <style>{`#support-discord {display: none}`}</style>
      <div
        className={clsx(
          "flex w-full bg-newBgColorInner rounded-[20px] flex-col relative max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden transition-[max-width] duration-300",
          step === "suggestions" ? "max-w-[1320px]" : "max-w-[860px]",
        )}
      >
        <div className="flex-1 flex overflow-y-auto p-4 sm:p-8 md:p-10">
          <div className="flex flex-col gap-[24px] flex-1 min-w-0">
            {step !== "loading" && <Progress step={step} />}
            {step === "channels" && <OnboardingChannelsStep integration={connectedLinkedIn} onFinish={() => setStep("positioning")} />}
            {step === "positioning" && (
              <OnboardingPositioningStep
                role={role}
                audience={audience}
                goal={goal}
                onChangeRole={setRole}
                onChangeAudience={setAudience}
                onChangeGoal={setGoal}
                onFinish={() => setStep("website")}
              />
            )}
            {step === "website" && (
              <OnboardingWebsiteStep websiteUrl={websiteUrl} onChangeWebsiteUrl={setWebsiteUrl} onFinish={() => setStep("loading")} />
            )}
            {step === "loading" && <OnboardingLoadingStep onComplete={generateSuggestions} />}
            {step === "suggestions" && suggestions[suggestionIndex] && (
              <OnboardingSuggestionStep
                suggestion={suggestions[suggestionIndex]}
                initialContent={editedContent[suggestions[suggestionIndex].id] || suggestions[suggestionIndex].content}
                integration={connectedLinkedIn}
                index={suggestionIndex}
                total={suggestions.length}
                onContentChange={(content) => {
                  const suggestion = suggestions[suggestionIndex]
                  if (!suggestion) {
                    return
                  }

                  const nextEditedContent = {
                    ...editedContent,
                    [suggestion.id]: content,
                  }
                  setEditedContent(nextEditedContent)
                  writeSuggestionsCache({
                    version: 1,
                    ...cacheIdentity,
                    suggestions,
                    reviewedSuggestions,
                    currentIndex: suggestionIndex,
                    editedContent: nextEditedContent,
                    createdAt: readSuggestionsCache()?.createdAt || new Date().toISOString(),
                  })
                }}
                onReview={reviewSuggestion}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Progress: FC<{ step: Exclude<OnboardingStep, "loading"> }> = ({ step }) => {
  const currentStep = step === "channels" ? 1 : step === "positioning" ? 2 : step === "website" ? 3 : 4

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[13px] font-medium text-customColor18 text-center">Step {currentStep} of 4</div>
      <div className="flex items-center gap-[8px]">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={clsx(
              "h-[6px] flex-1 rounded-full",
              currentStep >= item ? "bg-gradient-to-r from-[#622aff] to-[#8b5cf6]" : "bg-newTableHeader",
            )}
          />
        ))}
      </div>
    </div>
  )
}

const OnboardingChannelsStep: FC<{
  integration: any
  onFinish: () => void
}> = ({ integration, onFinish }) => {
  const fetch = useFetch()
  const t = useT()
  const toaster = useToaster()
  const fireEvents = useFireEvents()

  const connectLinkedIn = useCallback(async () => {
    fireEvents("integration_connect_clicked", {
      platform: "linkedin",
      onboarding: true,
      isExternal: false,
      isWeb3: false,
      isChromeExtension: false,
    })

    try {
      const { url, err } = await (await fetch("/integrations/social/linkedin?onboarding=true")).json()

      if (err || !url) {
        toaster.show(t("could_not_connect_to_platform", "Could not connect to the platform"), "warning")
        return
      }

      window.location.href = url
    } catch {
      toaster.show(t("could_not_connect_to_platform", "Could not connect to the platform"), "warning")
    }
  }, [fetch, fireEvents, t, toaster])

  return (
    <div className="flex flex-1 flex-col justify-center gap-[26px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">Connect your LinkedIn profile</div>
        <div className="text-[14px] text-customColor18">
          FeedVector starts by learning from your personal LinkedIn account. We will never post without your approval.
        </div>
      </div>

      {integration && (
        <div className="mx-auto w-full max-w-[680px] bg-newTableHeader rounded-[8px] p-[16px] border border-newTableBorder">
          <div className="text-[14px] font-medium mb-[12px]">{t("connected_channel", "Connected Channel")}</div>
          <div className="flex items-center gap-[10px] bg-customColor47/30 rounded-[8px] px-[12px] py-[10px]">
            <div className="relative w-[34px] h-[34px] shrink-0">
              <Image
                src={integration.picture || "/icons/platforms/linkedin.png"}
                className="rounded-full"
                alt={integration.identifier}
                width={34}
                height={34}
              />
              <Image
                src="/icons/platforms/linkedin.png"
                className="rounded-full absolute -bottom-[3px] -end-[3px] border border-fifth"
                alt="LinkedIn"
                width={16}
                height={16}
              />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-semibold truncate">{integration.name}</div>
              <div className="text-[12px] text-customColor18 truncate">Personal LinkedIn profile</div>
            </div>
          </div>
        </div>
      )}

      {!integration && (
        <button
          type="button"
          onClick={connectLinkedIn}
          className="group relative mx-auto w-full max-w-[680px] overflow-hidden rounded-[18px] border border-[#0a66c2]/30 bg-newTableHeader p-[2px] text-left transition-all hover:border-[#0a66c2]/70 hover:shadow-[0_18px_50px_rgba(10,102,194,0.18)]"
        >
          <div className="relative flex flex-col gap-[18px] rounded-[16px] bg-newBgColorInner px-[22px] py-[24px] sm:flex-row sm:items-center sm:justify-between sm:px-[28px] sm:py-[26px]">
            <div className="flex items-center gap-[16px] min-w-0">
              <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-[#0a66c2] shadow-[0_12px_30px_rgba(10,102,194,0.25)]">
                <img src="/icons/platforms/linkedin.png" className="h-[34px] w-[34px] rounded-[8px]" alt="" />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-semibold text-newTextColor">Connect LinkedIn profile</div>
                <div className="mt-[4px] text-[13px] leading-[18px] text-customColor18">
                  Use your personal LinkedIn account to personalize analytics, drafts, and recommendations.
                </div>
              </div>
            </div>
            <div className="flex h-[42px] shrink-0 items-center justify-center gap-[8px] rounded-[10px] bg-[#0a66c2] px-[16px] text-[14px] font-semibold text-white transition-transform group-hover:translate-x-[2px]">
              Connect
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      )}

      <div className="flex justify-center">
        <button
          disabled={!integration}
          onClick={onFinish}
          className={clsx(
            "group flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto",
            !integration ? "opacity-50 cursor-not-allowed" : "hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40",
          )}
        >
          {t("continue", "Continue")}
        </button>
      </div>
    </div>
  )
}

const SentenceSelect: FC<{
  id: string
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}> = ({ id, label, value, options, onChange }) => {
  const placeholder = "--------"
  const displayValue = value || placeholder
  const width = `calc(${Math.min(Math.max(displayValue.length, placeholder.length), 36)}ch + 46px)`

  return (
    <span className="relative inline-flex align-middle max-w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ width }}
        className={clsx(
          "h-[44px] max-w-full appearance-none rounded-[10px] border border-newTableBorder bg-newBgColorInner py-0 ps-[13px] pe-[40px] text-[15px] font-semibold outline-none transition-colors hover:border-[#8b5cf6]/60 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20",
          value ? "text-newTextColor" : "text-customColor18",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute end-[12px] top-1/2 flex h-[18px] w-[18px] -translate-y-1/2 items-center justify-center rounded-full bg-newTableHeader text-customColor18">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </span>
  )
}

const OnboardingPositioningStep: FC<{
  role: string
  audience: string
  goal: string
  onChangeRole: (value: string) => void
  onChangeAudience: (value: string) => void
  onChangeGoal: (value: string) => void
  onFinish: () => void
}> = ({ role, audience, goal, onChangeRole, onChangeAudience, onChangeGoal, onFinish }) => {
  const canContinue = !!role.trim() && !!audience.trim() && !!goal.trim()

  return (
    <div className="flex flex-1 flex-col justify-center gap-[26px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">Tell us your positioning</div>
        <div className="text-[14px] text-customColor18">Complete the sentence so drafts and recommendations match your niche.</div>
      </div>

      <div className="bg-newTableHeader rounded-[12px] border border-newTableBorder p-[18px] sm:p-[24px]">
        <div className="text-[22px] leading-[40px] font-medium text-newTextColor">
          <span>I'm a </span>
          <SentenceSelect id="onboarding-role" label="Role" value={role} options={roleOptions} onChange={onChangeRole} />
          <span> trying to reach </span>
          <SentenceSelect id="onboarding-audience" label="Audience" value={audience} options={audienceOptions} onChange={onChangeAudience} />
          <span> and my goal is to </span>
          <SentenceSelect id="onboarding-goal" label="Goal" value={goal} options={goalOptions} onChange={onChangeGoal} />
          <span>.</span>
        </div>
      </div>

      <div className="flex justify-center pt-[8px]">
        <button
          disabled={!canContinue}
          onClick={onFinish}
          className={clsx(
            "flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto",
            !canContinue ? "opacity-50 cursor-not-allowed" : "hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40",
          )}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

const OnboardingWebsiteStep: FC<{
  websiteUrl: string
  onChangeWebsiteUrl: (value: string) => void
  onFinish: () => void
}> = ({ websiteUrl, onChangeWebsiteUrl, onFinish }) => {
  const trimmedWebsiteUrl = websiteUrl.trim()
  const isInvalidWebsiteUrl = !!trimmedWebsiteUrl && !websiteUrlPattern.test(trimmedWebsiteUrl)

  return (
    <div className="flex flex-1 flex-col justify-center gap-[24px] py-[8px]">
      <div className="flex gap-[6px] flex-col text-center px-2 sm:px-0">
        <div className="text-[24px] font-semibold">Add a website (Optional) </div>
        <div className="text-[14px] text-customColor18">Add a personal or business website if it helps us understand your work.</div>
      </div>

      <div className="flex flex-col gap-[8px]">
        <label htmlFor="onboarding-website" className="text-[14px] font-medium">
          Personal/Business Website URL
        </label>
        <input
          id="onboarding-website"
          value={websiteUrl}
          onChange={(event) => onChangeWebsiteUrl(event.target.value)}
          placeholder="https://example.com"
          maxLength={2048}
          className={clsx(
            "h-[48px] rounded-[8px] border bg-newTableHeader px-[14px] text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]",
            isInvalidWebsiteUrl ? "border-red-500" : "border-newTableBorder",
          )}
          autoFocus
        />
        {isInvalidWebsiteUrl && <div className="text-[12px] text-red-500">Enter a valid public website URL, like example.com.</div>}
      </div>

      <div className="flex justify-center pt-[8px]">
        <button
          disabled={isInvalidWebsiteUrl}
          onClick={onFinish}
          className={clsx(
            "flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto",
            isInvalidWebsiteUrl ? "opacity-50 cursor-not-allowed" : "hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40",
          )}
        >
          Finish setup
        </button>
      </div>
    </div>
  )
}

const OnboardingSuggestionStep: FC<{
  suggestion: OnboardingSuggestion
  initialContent: string
  integration: any
  index: number
  total: number
  onContentChange: (content: string) => void
  onReview: (action: ReviewedSuggestion["action"], content: string, scheduleDate?: string) => Promise<void>
}> = ({ suggestion, initialContent, integration, index, total, onContentChange, onReview }) => {
  const [content, setContent] = useState(initialContent)
  const [scheduleDate, setScheduleDate] = useState("")
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [loadingAction, setLoadingAction] = useState<ReviewedSuggestion["action"] | null>(null)
  const scheduleInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setContent(initialContent)
    setScheduleDate("")
    setShowSchedulePicker(false)
    setLoadingAction(null)
  }, [initialContent, suggestion])

  const openSchedulePicker = () => {
    setShowSchedulePicker(true)
    setTimeout(() => {
      const input = scheduleInputRef.current as (HTMLInputElement & { showPicker?: () => void }) | null
      input?.focus()
      try {
        input?.showPicker?.()
      } catch {}
    }, 0)
  }

  const submit = async (action: ReviewedSuggestion["action"]) => {
    if (!content.trim()) {
      return
    }

    if (action === "schedule" && !showSchedulePicker) {
      openSchedulePicker()
      return
    }

    if (action === "schedule" && !scheduleDate) {
      return
    }

    setLoadingAction(action)
    await onReview(action, content.trim(), action === "schedule" ? scheduleDate : undefined)
    setLoadingAction(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-[16px] py-[4px]">
      <div className="flex flex-col items-center gap-[8px] text-center">
        <div className="text-[24px] font-semibold">
          We recommend you start with these posts ({index + 1}/{total})
        </div>
        <div className="text-[14px] text-customColor18">You can edit each post, then save, schedule, post, or ignore it.</div>
        <div className="mt-[4px] flex w-full max-w-[920px] flex-col gap-[8px] rounded-[14px] bg-newTableHeader/70 px-[12px] py-[10px] text-left">
          <div className="text-center text-[20px] font-semibold text-newTextColor">Post #{index + 1}</div>
          <div className="flex flex-wrap items-center justify-center gap-[8px]">
            <div className="flex min-w-0 items-center gap-[7px] rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-[11px] py-[6px] text-[#22c55e]">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em]">Goal</span>
              <span className="min-w-0 truncate text-[13px] font-semibold text-newTextColor">{suggestion.goal}</span>
            </div>
            <div className="flex min-w-0 items-center gap-[7px] rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-[11px] py-[6px] text-[#8b5cf6]">
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em]">Pillar</span>
              <span className="min-w-0 truncate text-[13px] font-semibold text-newTextColor">{suggestion.pillar}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-[14px] lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.82fr)]">
        <div className="flex min-w-0 flex-col gap-[8px]">
          <div className="text-[13px] font-semibold text-customColor18">Edit post content here:</div>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value)
              onContentChange(event.target.value)
            }}
            className="min-h-[360px] flex-1 resize-none rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px] text-[15px] leading-[24px] text-newTextColor outline-none focus:border-[#8b5cf6]"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-[8px]">
          <div className="text-[13px] font-semibold text-customColor18">How this post will look on LinkedIn:</div>
          <div className="overflow-hidden rounded-[12px] border border-borderPreview shadow-previewShadow">
            <IntegrationContext.Provider
              value={{
                date: dayjs(),
                integration,
                allIntegrations: integration ? [integration] : [],
                value: [
                  {
                    id: suggestion.id,
                    content,
                    image: [],
                  },
                ],
              }}
            >
              <LinkedinPreview maximumCharacters={3000} />
            </IntegrationContext.Provider>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex flex-col items-center gap-[12px] rounded-[14px] border border-newTableBorder bg-newBgColorInner/95 p-[14px] shadow-[0_-16px_40px_rgba(0,0,0,0.14)] backdrop-blur">
        {showSchedulePicker && (
          <label className="flex w-full max-w-[320px] flex-col gap-[6px] text-center text-[12px] text-customColor18">
            Choose date and time
            <input
              ref={scheduleInputRef}
              type="datetime-local"
              value={scheduleDate}
              onChange={(event) => setScheduleDate(event.target.value)}
              className="h-[42px] rounded-[8px] border border-newTableBorder bg-newTableHeader px-[12px] text-center text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]"
            />
          </label>
        )}

        <div className="flex flex-wrap justify-center gap-[8px]">
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => submit("ignored")}
            className="flex h-[42px] items-center justify-center gap-[8px] rounded-[10px] border border-[#ef4444]/35 bg-[#ef4444]/10 px-[14px] text-[14px] font-semibold text-[#ef4444] transition-colors hover:border-[#ef4444] hover:bg-[#ef4444] hover:text-white disabled:opacity-50"
          >
            <TrashIcon size={17} />
            {loadingAction === "ignored" ? "Ignoring..." : "Don't post this"}
          </button>
          <button
            type="button"
            disabled={!!loadingAction || !content.trim()}
            onClick={() => submit("draft")}
            className="h-[42px] rounded-[10px] border border-[#8b5cf6]/40 px-[14px] text-[14px] font-semibold text-newTextColor hover:border-[#8b5cf6] disabled:opacity-50"
          >
            {loadingAction === "draft" ? "Saving..." : "Save as draft"}
          </button>
          <button
            type="button"
            disabled={!!loadingAction || !content.trim()}
            onClick={() => submit("now")}
            className="h-[42px] rounded-[10px] bg-newTableHeader px-[14px] text-[14px] font-semibold text-newTextColor hover:bg-customColor47 disabled:opacity-50"
          >
            {loadingAction === "now" ? "Posting..." : "Post right now"}
          </button>
          <button
            type="button"
            disabled={!!loadingAction || !content.trim() || (showSchedulePicker && !scheduleDate)}
            onClick={() => submit("schedule")}
            className="h-[42px] rounded-[10px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] px-[14px] text-[14px] font-semibold text-white disabled:opacity-50"
          >
            {loadingAction === "schedule" ? "Scheduling..." : showSchedulePicker ? "Confirm schedule" : "Schedule for later"}
          </button>
        </div>
      </div>
    </div>
  )
}

const loadingMessages = [
  "Setting up your workspace...",
  "Reading your LinkedIn profile...",
  "Understanding your niche...",
  "Getting your info...",
  "Creating drafts that would work well for you. Please wait...",
]
const loadingMessageIntervalMs = 4 * 1000

const OnboardingLoadingStep: FC<{
  onComplete: () => Promise<boolean>
}> = ({ onComplete }) => {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      if (!cancelled) {
        await onComplete()
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [onComplete])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIndex((current) => Math.min(current + 1, loadingMessages.length - 1))
    }, loadingMessageIntervalMs)

    return () => window.clearInterval(interval)
  }, [])

  const isLastMessage = index === loadingMessages.length - 1

  return (
    <div className="min-h-[420px] flex flex-col items-center justify-center gap-[22px] text-center">
      <style>{`
        @keyframes onboardingLoadingMessageFade {
          0% { opacity: 0; transform: translateY(4px); }
          12% { opacity: 1; transform: translateY(0); }
          86% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-4px); }
        }

        @keyframes onboardingLoadingProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-[18px]">
        <div className="h-[54px] w-[54px] rounded-full border-[4px] border-newTableBorder border-t-[#8b5cf6] animate-spin" />
        <div className="text-[24px] font-semibold">Setting up your Workspace</div>
        <div className="h-[22px] text-[15px] text-customColor18">
          <span
            key={index}
            style={isLastMessage ? undefined : { animation: `onboardingLoadingMessageFade ${loadingMessageIntervalMs}ms ease-in-out` }}
          >
            {loadingMessages[index]}
          </span>
        </div>
        <div className="h-[9px] w-full overflow-hidden rounded-full bg-newTableHeader">
          <div
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-[#622aff] to-[#8b5cf6]"
            style={{ animation: `onboardingLoadingProgress ${onboardingLoadingMinimumMs}ms linear forwards` }}
          />
        </div>
      </div>
    </div>
  )
}
