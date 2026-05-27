"use client"

import React, { FC, useCallback, useEffect, useMemo, useState } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import useSWR, { useSWRConfig } from "swr"
import { orderBy } from "lodash"
import clsx from "clsx"
import Image from "next/image"
import { AddProviderComponent } from "@gitroom/frontend/components/launches/add.provider.component"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useToaster } from "@gitroom/react/toaster/toaster"
import { useRouter } from "next/navigation"

interface OnboardingModalProps {
  onClose: () => void
}

const onboardingGoals = [
  {
    id: "schedule_content_consistently",
    title: "Schedule content consistently",
    description: "Plan posts ahead of time and keep your channels active.",
  },
  {
    id: "manage_multiple_clients_or_brands",
    title: "Manage multiple social media accounts",
    description: "Organize channels and work across separate brands.",
  },
  {
    id: "use_mcp_server_with_ai_agents",
    title: "MCP server for scheduling posts with AI agents",
    description: "Allow your AI agent (or MCP client) to create and schedule posts using FeedVector's MCP server.",
  },
  {
    id: "analyze_social_performance",
    title: "Analyze performance of posts",
    description: "Track results and understand which channels are working.",
  },
  {
    id: "create_content_with_ai",
    title: "Create content at scale with AI",
    description: "Generate ideas, drafts, and assets in a few clicks.",
  },
  {
    id: "collaborate_with_team_members",
    title: "Collaborate with team members",
    description: "Invite team members and utilize the post approval workflow features for effectively managing social media accounts.",
  },
] as const

const onboardingPersonas = [
  {
    id: "founder_indie_hacker",
    title: "Founder / indie hacker",
  },
  {
    id: "creator_personal_brand",
    title: "Creator / personal brand",
  },
  {
    id: "startup_team",
    title: "Startup team",
  },
  {
    id: "marketing_team",
    title: "Marketing team",
  },
  {
    id: "agency_freelancer",
    title: "Agency / freelancer",
  },
  {
    id: "social_media_manager",
    title: "Social media manager",
  },
  {
    id: "other",
    title: "Other (specify)",
  },
] as const

const onboardingGoalRedirects: Record<(typeof onboardingGoals)[number]["id"], string> = {
  schedule_content_consistently: "/launches?onboardingAction=create-post",
  manage_multiple_clients_or_brands: "/launches?onboardingAction=add-channel",
  use_mcp_server_with_ai_agents: "/settings?tab=api",
  analyze_social_performance: "/analytics",
  create_content_with_ai: "/launches?onboardingAction=generate-posts",
  collaborate_with_team_members: "/settings?tab=teams&onboardingAction=add-member",
}

export const OnboardingModal: FC<OnboardingModalProps> = ({ onClose }) => {
  const fetch = useFetch()
  const [step, setStep] = useState<"channels" | "persona" | "goal">("channels")
  const [selectedPersona, setSelectedPersona] = useState<(typeof onboardingPersonas)[number]["id"] | null>(null)
  const [personaOther, setPersonaOther] = useState("")

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

  const connectedIntegrations = useMemo(() => {
    return integrations.filter((integration: any) => !integration.inBetweenSteps)
  }, [integrations])

  useEffect(() => {
    if (connectedIntegrations.length > 0 && step === "channels") {
      setStep("persona")
    }
  }, [connectedIntegrations.length, step])

  return (
    <div className="w-full min-h-full flex-1 p-4 sm:p-6 md:p-10 flex relative justify-center">
      <style>{`#support-discord {display: none}`}</style>
      <div className="flex w-full max-w-[980px] bg-newBgColorInner rounded-[20px] flex-col relative max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden">
        <div className="flex-1 flex overflow-y-auto p-4 sm:p-8 md:p-10">
          <div className="flex flex-col gap-[24px] flex-1 min-w-0">
            <Progress step={step} />
            {step === "channels" && <OnboardingChannelsStep integrations={connectedIntegrations} onFinish={() => setStep("persona")} />}
            {step === "persona" && (
              <OnboardingPersonaStep
                selectedPersona={selectedPersona}
                personaOther={personaOther}
                onChangePersona={setSelectedPersona}
                onChangePersonaOther={setPersonaOther}
                onFinish={() => setStep("goal")}
              />
            )}
            {step === "goal" && <OnboardingGoalStep persona={selectedPersona} personaOther={personaOther} onFinish={onClose} />}
          </div>
        </div>
      </div>
    </div>
  )
}

const Progress: FC<{ step: "channels" | "persona" | "goal" }> = ({ step }) => {
  const currentStep = step === "channels" ? 1 : step === "persona" ? 2 : 3

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="text-[13px] font-medium text-customColor18 text-center">Step {currentStep} of 3</div>
      <div className="flex items-center gap-[8px]">
        <div className={clsx("h-[6px] flex-1 rounded-full", "bg-gradient-to-r from-[#622aff] to-[#8b5cf6]")} />
        <div
          className={clsx("h-[6px] flex-1 rounded-full", currentStep >= 2 ? "bg-gradient-to-r from-[#622aff] to-[#8b5cf6]" : "bg-newTableHeader")}
        />
        <div
          className={clsx("h-[6px] flex-1 rounded-full", currentStep >= 3 ? "bg-gradient-to-r from-[#622aff] to-[#8b5cf6]" : "bg-newTableHeader")}
        />
      </div>
    </div>
  )
}

const OnboardingChannelsStep: FC<{
  integrations: any[]
  onFinish: () => void
}> = ({ integrations, onFinish }) => {
  const fetch = useFetch()
  const t = useT()

  const getIntegrations = useCallback(async () => {
    return (await fetch("/integrations")).json()
  }, [])

  const sortedIntegrations = useMemo(() => {
    return orderBy(integrations, ["type", "disabled", "identifier"], ["desc", "asc", "asc"])
  }, [integrations])

  const { data } = useSWR("get-all-integrations-onboarding", getIntegrations)

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex gap-[4px] flex-col text-center px-2 sm:px-0 mt-2 sm:mt-0">
        <div className="text-[24px] font-semibold">Welcome to FeedVector</div>
        <div className="text-[14px] text-customColor18">
          Connect at least one account to start scheduling posts. We will never post without your approval.
        </div>
      </div>

      {sortedIntegrations.length > 0 && (
        <div className="bg-newTableHeader rounded-[8px] p-[16px]">
          <div className="text-[14px] font-medium mb-[12px]">
            {t("connected_channels", "Connected Channels")} ({sortedIntegrations.length})
          </div>
          <div className="flex flex-wrap gap-[12px] max-h-[35dvh] sm:max-h-none overflow-y-auto pr-1">
            {sortedIntegrations.map((integration: any) => (
              <div key={integration.id} className="flex items-center gap-[8px] bg-customColor47/30 rounded-[8px] px-[12px] py-[8px]">
                <div className="relative w-[28px] h-[28px]">
                  <Image src={integration.picture} className="rounded-full" alt={integration.identifier} width={28} height={28} />
                  <Image
                    src={`/icons/platforms/${integration.identifier}.png`}
                    className="rounded-full absolute -bottom-[3px] -end-[3px] border border-fifth"
                    alt={integration.identifier}
                    width={14}
                    height={14}
                  />
                </div>
                <span className="text-[13px]">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-[12px]">
        <div className="text-[14px] font-medium">{t("click_channel_to_add", "Click a channel to add it")}</div>
        {data && <AddProviderComponent invite={false} social={data.social || []} article={data.article || []} onboarding={true} />}
      </div>

      <div className="flex justify-end pt-[24px] mt-[8px]">
        <button
          disabled={sortedIntegrations.length === 0}
          onClick={onFinish}
          className={clsx(
            "group flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto",
            sortedIntegrations.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40",
          )}
        >
          {t("continue", "Continue")}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-1 transition-transform"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

const OnboardingPersonaStep: FC<{
  selectedPersona: (typeof onboardingPersonas)[number]["id"] | null
  personaOther: string
  onChangePersona: (persona: (typeof onboardingPersonas)[number]["id"]) => void
  onChangePersonaOther: (value: string) => void
  onFinish: () => void
}> = ({ selectedPersona, personaOther, onChangePersona, onChangePersonaOther, onFinish }) => {
  const canContinue = !!selectedPersona && (selectedPersona !== "other" || !!personaOther.trim())

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex gap-[4px] flex-col text-center px-2 sm:px-0 mt-2 sm:mt-0">
        <div className="text-[24px] font-semibold">What best describes you?</div>
        <div className="text-[14px] text-customColor18">This helps us personalize onboarding and recommendations.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {onboardingPersonas.map((persona) => {
          const selected = selectedPersona === persona.id
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onChangePersona(persona.id)}
              className={clsx(
                "text-start rounded-[8px] border p-[16px] min-h-[64px] transition-colors bg-newTableHeader",
                selected ? "border-[#8b5cf6] bg-customColor47/30" : "border-newTableBorder hover:border-customColor18",
              )}
            >
              <div className="flex gap-[12px] items-center">
                <div
                  className={clsx(
                    "h-[18px] w-[18px] rounded-full border flex items-center justify-center shrink-0",
                    selected ? "border-[#8b5cf6]" : "border-customColor18",
                  )}
                >
                  {selected && <div className="h-[8px] w-[8px] rounded-full bg-[#8b5cf6]" />}
                </div>
                <div className="text-[15px] font-semibold text-newTextColor">{persona.title}</div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedPersona === "other" && (
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="onboarding-persona-other" className="text-[14px] font-medium">
            Specify what best describes you
          </label>
          <input
            id="onboarding-persona-other"
            value={personaOther}
            onChange={(event) => onChangePersonaOther(event.target.value)}
            maxLength={120}
            className="h-[46px] rounded-[8px] border border-newTableBorder bg-newTableHeader px-[14px] text-[14px] text-newTextColor outline-none focus:border-[#8b5cf6]"
            autoFocus
          />
        </div>
      )}

      <div className="flex justify-end pt-[8px]">
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

const OnboardingGoalStep: FC<{
  persona: (typeof onboardingPersonas)[number]["id"] | null
  personaOther: string
  onFinish: () => void
}> = ({ persona, personaOther, onFinish }) => {
  const fetch = useFetch()
  const router = useRouter()
  const toaster = useToaster()
  const { mutate } = useSWRConfig()
  const [selectedGoal, setSelectedGoal] = useState<(typeof onboardingGoals)[number]["id"] | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = useCallback(async () => {
    if (!selectedGoal || !persona || loading) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/user/onboarding", {
        method: "POST",
        body: JSON.stringify({
          goal: selectedGoal,
          persona,
          personaOther: persona === "other" ? personaOther.trim() : undefined,
        }),
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        toaster.show(text || "Could not complete onboarding", "warning")
        return
      }

      await mutate("/user/self")
      const redirectUrl = onboardingGoalRedirects[selectedGoal]
      onFinish()
      router.push(redirectUrl)
    } finally {
      setLoading(false)
    }
  }, [fetch, loading, mutate, onFinish, persona, personaOther, router, selectedGoal, toaster])

  return (
    <div className="flex flex-col gap-[24px]">
      <div className="flex gap-[4px] flex-col text-center px-2 sm:px-0 mt-2 sm:mt-0">
        <div className="text-[24px] font-semibold">What's your main goal?</div>
        <div className="text-[14px] text-customColor18">We will use this to personalize product guidance for you.</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
        {onboardingGoals.map((goal) => {
          const selected = selectedGoal === goal.id
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelectedGoal(goal.id)}
              className={clsx(
                "text-start rounded-[8px] border p-[16px] min-h-[112px] transition-colors bg-newTableHeader",
                selected ? "border-[#8b5cf6] bg-customColor47/30" : "border-newTableBorder hover:border-customColor18",
              )}
            >
              <div className="flex gap-[12px]">
                <div
                  className={clsx(
                    "mt-[2px] h-[18px] w-[18px] rounded-full border flex items-center justify-center shrink-0",
                    selected ? "border-[#8b5cf6]" : "border-customColor18",
                  )}
                >
                  {selected && <div className="h-[8px] w-[8px] rounded-full bg-[#8b5cf6]" />}
                </div>
                <div className="flex flex-col gap-[6px]">
                  <div className="text-[15px] font-semibold text-newTextColor">{goal.title}</div>
                  <div className="text-[13px] leading-[18px] text-customColor18 whitespace-normal">{goal.description}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end pt-[8px]">
        <button
          disabled={!selectedGoal || !persona || loading}
          onClick={submit}
          className={clsx(
            "flex items-center justify-center gap-[12px] bg-gradient-to-r from-[#622aff] to-[#8b5cf6] text-white font-semibold px-[24px] sm:px-[32px] py-[14px] rounded-[12px] text-[16px] transition-all shadow-lg shadow-purple-500/25 w-full sm:w-auto",
            !selectedGoal || !persona || loading
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-[#7c3aff] hover:to-[#9d6eff] hover:shadow-purple-500/40",
          )}
        >
          {loading ? "Saving..." : "Finish"}
        </button>
      </div>
    </div>
  )
}
