"use client"

import useSWR from "swr"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { Button } from "@gitroom/react/form/button"
import { LoadingComponent } from "@gitroom/frontend/components/layout/loading"
import { useRouter } from "next/navigation"
import { useToaster } from "@gitroom/react/toaster/toaster"

type IntegrationItem = {
  id: string
  name: string
  identifier: string
  picture: string
  inBetweenSteps: boolean
  refreshNeeded: boolean
  onboardingProfileReady?: boolean
  linkedinProfileFetchedAt?: string | null
}

type RecommendationItem = {
  url: string
  embedUrl: string
  activityId: string
  title: string
  snippet: string
  date?: string
  score: number
}

type RecommendationResponse = {
  generatedAt: string
  goal: string
  pillars: string[]
  queries: Array<{ category: string; query: string }>
  recommendations: RecommendationItem[]
  refreshPolicy?: {
    limited: boolean
    canRefresh: boolean
    waitSeconds: number
    nextRefreshAt?: string
  }
}

const formatRefreshWait = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.ceil(seconds / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const parts: string[] = []

  if (hours > 0) {
    parts.push(`${hours} hr${hours === 1 ? "" : "s"}`)
  }

  if (minutes > 0 || !parts.length) {
    parts.push(`${minutes} min${minutes === 1 ? "" : "s"}`)
  }

  return parts.join(" ")
}

export const LinkedinCommentOpportunities = () => {
  const fetch = useFetch()
  const router = useRouter()
  const toaster = useToaster()
  const [refreshing, setRefreshing] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const loadIntegrations = useCallback(async () => {
    const response = await (await fetch("/integrations/list")).json()
    return ((response?.integrations || []) as IntegrationItem[])
      .filter((integration) => integration.identifier === "linkedin" && !integration.inBetweenSteps)
      .sort((a, b) => {
        const readiness = Number(!!b.onboardingProfileReady) - Number(!!a.onboardingProfileReady)
        if (readiness !== 0) {
          return readiness
        }
        return new Date(b.linkedinProfileFetchedAt || 0).getTime() - new Date(a.linkedinProfileFetchedAt || 0).getTime()
      })
  }, [fetch])

  const { data: integrations = [], isLoading: loadingIntegrations } = useSWR("linkedin-engage-integrations", loadIntegrations, {
    revalidateOnFocus: false,
  })

  const selectedIntegration = integrations[0]

  const loadRecommendations = useCallback(async () => {
    if (!selectedIntegration?.id) {
      return null
    }

    const response = await fetch(`/user/linkedin-comment-opportunities?integrationId=${selectedIntegration.id}`)
    const json = await response.json()

    if (!response.ok) {
      throw new Error(json?.message || "Could not load LinkedIn comment opportunities")
    }

    return json as RecommendationResponse
  }, [fetch, selectedIntegration?.id])

  const {
    data,
    error,
    isLoading: loadingRecommendations,
    mutate,
  } = useSWR(selectedIntegration?.id ? `linkedin-comment-opportunities-${selectedIntegration.id}` : null, loadRecommendations, {
    revalidateOnFocus: false,
  })

  const errorMessage = error instanceof Error ? error.message : error ? String(error) : ""

  const generatedAt = useMemo(() => {
    if (!data?.generatedAt) {
      return ""
    }

    return new Date(data.generatedAt).toLocaleString()
  }, [data?.generatedAt])

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30 * 1000)

    return () => window.clearInterval(interval)
  }, [])

  const refreshWaitSeconds = useMemo(() => {
    if (!data?.refreshPolicy?.limited || !data.refreshPolicy.nextRefreshAt) {
      return 0
    }

    return Math.max(0, Math.ceil((new Date(data.refreshPolicy.nextRefreshAt).getTime() - now) / 1000))
  }, [data?.refreshPolicy?.limited, data?.refreshPolicy?.nextRefreshAt, now])

  const refreshDisabled = !!data?.refreshPolicy?.limited && refreshWaitSeconds > 0
  const refreshWaitMessage = refreshDisabled
    ? `Free users are allowed to refresh posts every 6 hours. Please wait for ${formatRefreshWait(refreshWaitSeconds)}.`
    : ""

  const refreshRecommendations = useCallback(async () => {
    if (!selectedIntegration?.id) {
      return
    }

    if (refreshDisabled) {
      return
    }

    try {
      setRefreshing(true)
      const response = await fetch(`/user/linkedin-comment-opportunities?integrationId=${selectedIntegration.id}&refresh=1`)
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.message || "Could not refresh LinkedIn comment opportunities")
      }

      await mutate(json, false)
    } catch (err: any) {
      toaster.show(err?.message || "Could not refresh LinkedIn comment opportunities", "warning")
    } finally {
      setRefreshing(false)
    }
  }, [fetch, mutate, refreshDisabled, selectedIntegration?.id, toaster])

  if (loadingIntegrations || (selectedIntegration?.id && loadingRecommendations && !data)) {
    return <LoadingComponent />
  }

  if (!selectedIntegration) {
    return (
      <div className="w-full rounded-[14px] border border-newTableBorder bg-newTableHeader p-[18px]">
        <div className="text-[22px] font-[700] text-newTextColor">Engage on LinkedIn</div>
        <div className="mt-[8px] max-w-[640px] text-[14px] leading-[22px] text-textItemBlur">
          Connect your personal LinkedIn account first. This page finds fresh posts worth opening and joining on LinkedIn.
        </div>
        <div className="mt-[16px]">
          <Button className="rounded-[10px]" onClick={() => router.push("/launches")}>
            Connect LinkedIn
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-[14px] border border-newTableBorder bg-newTableHeader p-[18px]">
        <div className="text-[22px] font-[700] text-newTextColor">Engage on LinkedIn</div>
        <div className="mt-[8px] text-[14px] leading-[22px] text-textItemBlur">{errorMessage}</div>
        <div className="mt-[16px]">
          <Button secondary={true} className="rounded-[10px]" onClick={refreshRecommendations} loading={refreshing}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-[16px]">
      <section className="w-full border border-newTableBorder bg-newTableHeader p-[18px]">
        <div className="flex flex-col gap-[14px] lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-[24px] font-[700] text-newTextColor">Comment on these posts to grow your audience</div>
            <div className="mt-[8px] max-w-[760px] text-[14px] leading-[22px] text-textItemBlur">
              Fresh posts from the last 24 hours. Open any post on LinkedIn to read, react, or join the conversation.
            </div>
            {!!generatedAt && (
              <div className="mt-[12px] inline-flex rounded-full border border-[#8b5cf6]/25 bg-[#8b5cf6]/10 px-[10px] py-[5px] text-[12px] font-[600] text-[#6d28d9] dark:bg-[#8b5cf6]/15 dark:text-[#c4b5fd]">
                Last updated: {generatedAt}
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-[8px] lg:items-end">
            <Button secondary={true} className="rounded-[10px]" onClick={refreshRecommendations} loading={refreshing} disabled={refreshDisabled}>
              Refresh posts
            </Button>
            {!!refreshWaitMessage && (
              <div className="max-w-[360px] text-left text-[12px] leading-[18px] text-textItemBlur lg:text-right">{refreshWaitMessage}</div>
            )}
          </div>
        </div>
      </section>

      {!data?.recommendations?.length ? (
        <section className="w-full rounded-[14px] border border-newTableBorder bg-newTableHeader p-[18px]">
          <div className="text-[17px] font-[700] text-newTextColor">No strong opportunities found yet</div>
          <div className="mt-[8px] text-[14px] leading-[22px] text-textItemBlur">
            Try refreshing the list. If this keeps happening, broaden the content profile so the search has better topics and audience cues to work
            with.
          </div>
        </section>
      ) : (
        <div className="flex w-full min-w-0 flex-col gap-[14px] 2xl:gap-[16px]">
          {data.recommendations.map((recommendation) => (
            <article key={recommendation.url} className="w-full rounded-[14px] border border-newTableBorder bg-newTableHeader p-[16px] 2xl:p-[22px]">
              <div className="flex w-full min-w-0 flex-col gap-[14px] 2xl:gap-[18px]">
                <div className="relative w-full overflow-hidden rounded-[12px] border border-newTableBorder bg-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
                  <iframe
                    src={recommendation.embedUrl}
                    title={recommendation.title}
                    className="pointer-events-none h-[360px] w-full bg-white lg:h-[400px] 2xl:h-[560px]"
                    allowFullScreen
                  />

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex min-h-[120px] items-end justify-center bg-gradient-to-t from-black/75 via-black/35 to-transparent p-[18px]">
                    <Button
                      className="pointer-events-auto shrink-0 rounded-[10px] px-[18px]"
                      onClick={() => window.open(recommendation.url, "_blank", "noopener,noreferrer")}
                    >
                      View full post on LinkedIn
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
