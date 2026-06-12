import { FC, useCallback, useMemo, useState } from "react"
import { Integration } from "@prisma/client"
import useSWR from "swr"
import { useFetch } from "@gitroom/helpers/utils/custom.fetch"
import { ChartSocial } from "@gitroom/frontend/components/analytics/chart-social"
import { LoadingComponent } from "@gitroom/frontend/components/layout/loading"
import { useT } from "@gitroom/react/translation/get.transation.service.client"
import { useUser } from "@gitroom/frontend/components/layout/user.context"
import clsx from "clsx"
import { Button } from "@gitroom/react/form/button"
import { useRouter } from "next/navigation"

interface AnalyticsDataItem {
  key?: string
  label: string
  data: Array<{ total: number | string; date: string; label?: string; [key: string]: any }>
  average?: boolean
  percentageChange?: number
  chartType?: "line" | "bar" | "horizontalBar" | "doughnut"
  total?: string | number
  insight?: string
  recommendation?: string
  confidence?: "Low" | "Medium" | "High"
  meta?: Record<string, any>
}

const numberFormatter = new Intl.NumberFormat()

const toNumber = (value: unknown) => {
  if (typeof value === "number") {
    return value
  }

  if (typeof value === "string") {
    return Number(value.replace(/,/g, "")) || 0
  }

  return 0
}

const formatNumber = (value: unknown) => numberFormatter.format(Math.round(toNumber(value)))

const formatPostFormat = (value?: string) => {
  if (!value) {
    return undefined
  }

  return `${value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")} post`
}

const normalizeChartData = (data: AnalyticsDataItem["data"]) =>
  data.map((row) => ({
    ...row,
    total: toNumber(row.total),
  }))

const TrendIndicator: FC<{ value: number; average?: boolean }> = ({ value, average }) => {
  if (value === 0) return null

  const isPositive = value > 0
  const displayValue = Math.abs(value).toFixed(1)

  return (
    <div className={`flex items-center gap-[4px] text-[13px] font-medium ${isPositive ? "text-[#32d583]" : "text-[#f97066]"}`}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={isPositive ? "" : "rotate-180"}>
        <path d="M6 2.5L10 7.5H2L6 2.5Z" fill="currentColor" />
      </svg>
      <span>
        {displayValue}
        {average ? "pp" : "%"}
      </span>
    </div>
  )
}

const OriginalResharedSummary: FC<{ item: AnalyticsDataItem }> = ({ item }) => {
  const original = toNumber(item.data.find((row) => (row.label || row.date).toLowerCase() === "original")?.total)
  const reshared = toNumber(item.data.find((row) => (row.label || row.date).toLowerCase() === "reshared")?.total)
  const total = original + reshared
  const originalPercent = total > 0 ? (original / total) * 100 : 0
  const resharedPercent = total > 0 ? (reshared / total) * 100 : 0

  return (
    <div className="flex-1 flex flex-col justify-center px-[16px] pb-[18px] pt-[8px]">
      <div className="h-[14px] rounded-full overflow-hidden bg-newBgColorInner border border-newTableBorder flex">
        <div className="h-full bg-[#612bd3]" style={{ width: `${originalPercent}%` }} />
        <div className="h-full bg-[#32d583]" style={{ width: `${resharedPercent}%` }} />
      </div>
      <div className="mt-[16px] grid grid-cols-2 divide-x divide-newTableBorder border-t border-newTableBorder pt-[14px]">
        <div className="pe-[14px]">
          <div className="flex items-center gap-[6px] text-[12px] text-textItemBlur">
            <span className="w-[7px] h-[7px] rounded-full bg-[#612bd3]" />
            Original
          </div>
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{formatNumber(original)}</div>
          <div className="mt-[2px] text-[12px] text-textItemBlur">{originalPercent.toFixed(0)}%</div>
        </div>
        <div className="ps-[14px]">
          <div className="flex items-center gap-[6px] text-[12px] text-textItemBlur">
            <span className="w-[7px] h-[7px] rounded-full bg-[#32d583]" />
            Reshared
          </div>
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{formatNumber(reshared)}</div>
          <div className="mt-[2px] text-[12px] text-textItemBlur">{resharedPercent.toFixed(0)}%</div>
        </div>
      </div>
    </div>
  )
}

const AnalyticsCard: FC<{
  item: AnalyticsDataItem
  total: string | number
  index: number
}> = ({ item, total, index }) => {
  const colorVariants = ["purple", "green", "blue"] as const
  const color = colorVariants[index % colorVariants.length]

  const hasMultipleDataPoints = item.data.length > 1
  const isOriginalResharedPosts = item.label === "Original vs reshared posts"
  const isTopPosts = item.label === "Top 10 posts by engagement"
  const needsRoom = ["Media type performance", "Post length performance", "Posting day/time performance"].includes(item.label)
  const isWide = isTopPosts || needsRoom
  const chartHeight = isTopPosts ? "h-[360px]" : item.chartType === "horizontalBar" ? "h-[260px]" : needsRoom ? "h-[190px]" : "h-[140px]"
  const labelLimit = isTopPosts ? 38 : item.chartType === "horizontalBar" ? 44 : 22
  const anchorChartBottom = item.chartType === "bar" || item.chartType === "horizontalBar" || item.chartType === "line" || !item.chartType
  const cardMinHeight = isTopPosts ? "min-h-[520px]" : item.chartType === "horizontalBar" ? "min-h-[380px]" : anchorChartBottom ? "min-h-[300px]" : ""

  return (
    <div className={clsx("group relative", isTopPosts ? "lg:col-span-3" : isWide ? "lg:col-span-2" : "")}>
      <div
        className={clsx(
          `
          flex flex-col h-full
          bg-newTableHeader
          border border-newTableBorder
          rounded-[12px]
          overflow-hidden
          transition-all duration-200
          hover:border-[#612bd3]/50
        `,
          cardMinHeight,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[16px] pt-[14px] pb-[8px]">
          <div className="flex items-center gap-[10px]">
            <div
              className={`
                w-[8px] h-[8px] rounded-full
                ${color === "purple" ? "bg-[#612bd3]" : ""}
                ${color === "green" ? "bg-[#32d583]" : ""}
                ${color === "blue" ? "bg-[#1d9bf0]" : ""}
              `}
            />
            <span className="text-[15px] font-medium text-newTableText">{item.label}</span>
          </div>
          {item.percentageChange !== undefined && <TrendIndicator value={item.percentageChange} average={item.average} />}
        </div>

        {/* Content */}
        {isOriginalResharedPosts ? (
          <OriginalResharedSummary item={item} />
        ) : hasMultipleDataPoints ? (
          <>
            {/* Chart */}
            <div
              className={clsx("flex-1 px-[16px] flex flex-col", anchorChartBottom ? "justify-end pt-[28px] pb-[18px]" : "justify-center py-[10px]")}
            >
              <div className={clsx("relative", chartHeight)}>
                <ChartSocial
                  data={normalizeChartData(item.data)}
                  color={color}
                  type={item.chartType || "line"}
                  labelLimit={labelLimit}
                  key={`chart-${index}`}
                />
              </div>
            </div>
          </>
        ) : (
          /* Single value display */
          <div className="flex-1 flex flex-col items-center justify-center py-[32px] px-[16px]">
            <div className="text-[48px] leading-[56px] font-semibold tracking-tight">{total}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const InsightCard: FC<{
  label: string
  value: string | number
  detail?: string
  accent?: "purple" | "green" | "blue" | "orange"
}> = ({ label, value, detail, accent = "purple" }) => {
  const accentClass = {
    purple: "bg-[#612bd3]",
    green: "bg-[#32d583]",
    blue: "bg-[#1d9bf0]",
    orange: "bg-[#f79009]",
  }[accent]

  return (
    <div className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px]">
      <div className="flex items-center gap-[8px] text-[13px] font-medium text-customColor18">
        <span className={clsx("h-[7px] w-[7px] rounded-full", accentClass)} />
        {label}
      </div>
      <div className="mt-[10px] text-[28px] leading-[34px] font-semibold text-newTableText">{value}</div>
      {detail && <div className="mt-[6px] text-[12px] leading-[18px] text-customColor18">{detail}</div>}
    </div>
  )
}

const ConfidenceBadge: FC<{ value?: string }> = ({ value }) => {
  if (!value) {
    return null
  }

  const className =
    value === "High"
      ? "border-[#32d583]/25 bg-[#32d583]/10 text-[#0f9f5f]"
      : value === "Medium"
      ? "border-[#f79009]/20 bg-[#fff7ed] text-[#b54708]"
      : "border-newTableBorder bg-newBgColorInner text-customColor18"

  return (
    <span
      className={clsx("inline-flex h-[24px] shrink-0 items-center rounded-full border px-[9px] text-[11px] font-semibold leading-none", className)}
    >
      {value} confidence
    </span>
  )
}

const PatternCard: FC<{ item?: AnalyticsDataItem; title: string; type?: "bar" | "horizontalBar" }> = ({ item, title, type = "bar" }) => {
  if (!item) {
    return null
  }

  const topRows = (item.data || []).slice(0, 3)

  return (
    <div className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div>
          <div className="text-[15px] font-semibold text-newTableText">{title}</div>
          {item.insight && <div className="mt-[5px] text-[13px] leading-[19px] text-customColor18">{item.insight}</div>}
        </div>
        <ConfidenceBadge value={item.confidence} />
      </div>
      <div className="mt-[14px] h-[170px]">
        <ChartSocial data={normalizeChartData(item.data)} type={type} color="purple" labelLimit={type === "horizontalBar" ? 34 : 22} />
      </div>
      <div className="mt-[12px] grid gap-[7px]">
        {topRows.map((row) => (
          <div
            key={row.label || row.date}
            className="flex items-center justify-between gap-[10px] rounded-[8px] bg-newBgColorInner px-[10px] py-[7px]"
          >
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-newTableText">{row.label || row.date}</div>
              <div className="text-[11px] text-customColor18">{row.count ? `Total ${row.count} posts` : "Posts analyzed"}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[12px] font-semibold">{formatNumber(row.total)}</div>
              {typeof row.vsAverage === "number" && (
                <div className={clsx("text-[11px]", row.vsAverage >= 0 ? "text-[#32d583]" : "text-[#f97066]")}>
                  {row.vsAverage >= 0 ? "+" : ""}
                  {row.vsAverage}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {item.recommendation && (
        <div className="mt-[12px] rounded-[8px] bg-[#612bd3]/10 p-[10px] text-[12px] leading-[18px] text-newTableText">{item.recommendation}</div>
      )}
    </div>
  )
}

const TopPostsTable: FC<{ item?: AnalyticsDataItem }> = ({ item }) => {
  const [sortBy, setSortBy] = useState<"engagement" | "comments" | "reposts" | "recent" | "original">("engagement")
  const rows = useMemo(() => {
    const data = [...(item?.data || [])]
    const filtered = sortBy === "original" ? data.filter((row) => !row.reshared) : data
    const getValue = (row: any) => {
      if (sortBy === "comments") return toNumber(row.comments)
      if (sortBy === "reposts") return toNumber(row.reposts)
      if (sortBy === "recent") return toNumber(row.timestamp)
      return toNumber(row.total)
    }

    return filtered.sort((a, b) => getValue(b) - getValue(a)).slice(0, 10)
  }, [item, sortBy])

  if (!item) {
    return null
  }

  return (
    <div className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px]">
      <div className="flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[17px] font-semibold text-white">Top posts by engagement</div>
          <div className="mt-[5px] text-[13px] text-customColor18">{item.insight}</div>
        </div>
        <div className="flex flex-wrap gap-[6px]">
          {[
            ["engagement", "Engagement"],
            ["comments", "Comments"],
            ["reposts", "Reposts"],
            ["recent", "Recent"],
            ["original", "Original only"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSortBy(value as any)}
              className={clsx(
                "rounded-[7px] border px-[9px] py-[5px] text-[12px] font-semibold",
                sortBy === value ? "border-[#612bd3] bg-[#612bd3] text-white" : "border-newTableBorder bg-newBgColorInner text-customColor18",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-[14px] overflow-hidden rounded-[10px] border border-newTableBorder">
        <div className="grid grid-cols-[minmax(0,1fr)_88px_88px_80px_96px] gap-[10px] bg-newBgColorInner px-[12px] py-[9px] text-[11px] font-semibold uppercase tracking-[0.06em] text-customColor18">
          <div>Post</div>
          <div className="text-right">Eng.</div>
          <div className="text-right">Comments</div>
          <div className="text-right">Reposts</div>
          <div>Format</div>
        </div>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className="grid grid-cols-[minmax(0,1fr)_88px_88px_80px_96px] gap-[10px] border-t border-newTableBorder px-[12px] py-[10px] text-[13px]"
          >
            <div className="min-w-0">
              <div className="truncate font-semibold text-newTableText">{row.label}</div>
              <div className="mt-[3px] truncate text-[12px] text-customColor18">
                {row.hookStyle} · {row.publishedAt}
              </div>
            </div>
            <div className="text-right font-semibold">{formatNumber(row.total)}</div>
            <div className="text-right">{formatNumber(row.comments)}</div>
            <div className="text-right">{formatNumber(row.reposts)}</div>
            <div className="capitalize text-customColor18">{row.format}</div>
          </div>
        ))}
      </div>
      {item.recommendation && (
        <div className="mt-[12px] rounded-[8px] bg-[#612bd3]/10 p-[10px] text-[12px] leading-[18px] text-newTableText">{item.recommendation}</div>
      )}
    </div>
  )
}

const LinkedinAnalyticsView: FC<{ data: AnalyticsDataItem[] }> = ({ data }) => {
  const item = useCallback((key: string, label?: string) => data.find((row) => row.key === key || (label && row.label === label)), [data])
  const overview = item("performance_overview")
  const trend = item("engagement_trend")
  const bestPost = item("best_post_engagement")
  const postsPerWeek = item("posts_per_week")
  const nextDecision = item("next_content_decision")
  const responseMix = item("response_mix")
  const comments = item("total_comments")
  const reposts = item("total_reposts")
  const reactions = item("total_reactions")

  return (
    <div className="flex flex-col gap-[16px]">
      <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          label="Avg engagement/post"
          value={overview?.meta?.averageEngagement ?? overview?.total ?? "0"}
          detail={`${overview?.meta?.postsAnalyzed || 0} posts analyzed`}
          accent="purple"
        />
        <InsightCard
          label="Engagement trend"
          value={(trend?.percentageChange || 0) >= 0 ? "Improving" : "Declining"}
          detail={`${trend?.percentageChange || 0}% between period halves`}
          accent={(trend?.percentageChange || 0) >= 0 ? "green" : "orange"}
        />
        <InsightCard
          label="Best post"
          value={`${bestPost?.total || 0} engagements`}
          detail={
            bestPost?.meta?.vsAverage
              ? `${bestPost.meta.vsAverage}x your average · Format: ${formatPostFormat(bestPost.meta.format)}`
              : bestPost?.meta?.format
              ? `Format: ${formatPostFormat(bestPost.meta.format)}`
              : undefined
          }
          accent="blue"
        />
        <InsightCard
          label="Posting consistency"
          value={`${postsPerWeek?.total || "0"} / week`}
          detail={
            postsPerWeek?.meta?.period
              ? `Based on ${postsPerWeek.meta.postsAnalyzed || 0} posts from ${postsPerWeek.meta.period}`
              : "Recent publishing pace"
          }
          accent="orange"
        />
      </div>

      {nextDecision && (
        <div className="rounded-[12px] border border-[#612bd3]/30 bg-[#612bd3]/10 p-[18px]">
          <div className="flex flex-col gap-[12px] lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-white">🧠 Based on our analysis, you next post should be..</div>
              <div className="mt-[8px] max-w-[820px] text-[15px] leading-[23px] text-newTableText">{nextDecision.recommendation}</div>
              <div className="mt-[8px] text-[13px] text-customColor18">{nextDecision.meta?.why}</div>
            </div>
            <ConfidenceBadge value={nextDecision.confidence} />
          </div>
        </div>
      )}

      <TopPostsTable item={item("top_posts_by_engagement", "Top 10 posts by engagement")} />

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
        <PatternCard title="Media type performance" item={item("media_type_performance")} />
        <PatternCard title="Post length performance" item={item("post_length_performance")} />
        <PatternCard title="Posting day/time performance" item={item("posting_day_time_performance")} type="horizontalBar" />
      </div>

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
        <PatternCard title="Best topic / pillar" item={item("topic_performance")} />
        <PatternCard title="Best hook style" item={item("hook_style_performance")} />
        <PatternCard title="Best CTA style" item={item("cta_style_performance")} />
      </div>

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-3">
        <InsightCard
          label="Conversation"
          value={`${comments?.total || 0} comments`}
          detail={`Avg ${((responseMix?.meta?.averageComments || 0) as number).toFixed(1)} comments/post`}
          accent="green"
        />
        <InsightCard
          label="Amplification"
          value={`${reposts?.total || 0} reposts`}
          detail={`Avg ${((responseMix?.meta?.averageReposts || 0) as number).toFixed(1)} reposts/post`}
          accent="blue"
        />
        <InsightCard
          label="Reactions"
          value={`${reactions?.total || 0} reactions`}
          detail={`Avg ${((responseMix?.meta?.averageReactions || 0) as number).toFixed(1)} reactions/post`}
          accent="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
        <PatternCard title="Original vs reshared performance" item={item("original_vs_reshared_performance")} />
        {item("reaction_type_breakdown") && (
          <div className="flex min-h-[360px] flex-col rounded-[12px] border border-newTableBorder bg-newTableHeader p-[16px]">
            <div className="text-[15px] font-semibold text-newTableText">Detailed reaction breakdown</div>
            <div className="flex flex-1 items-center justify-center py-[24px]">
              <div className="h-[230px] w-full">
                <ChartSocial data={normalizeChartData(item("reaction_type_breakdown")!.data)} type="doughnut" color="blue" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const EmptyState: FC<{ onRefresh: () => void }> = ({ onRefresh }) => {
  const t = useT()

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-[48px] px-[24px] bg-newTableHeader border border-newTableBorder rounded-[12px]">
      <div className="w-[48px] h-[48px] mb-[16px] rounded-full bg-[#612bd3]/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#612bd3]">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M12 8v4l2 2" />
        </svg>
      </div>
      <p className="text-[15px] text-newTableText text-center mb-[12px]">
        {t("this_channel_needs_to_be_refreshed", "This channel needs to be refreshed to display analytics")}
      </p>
      <button
        onClick={onRefresh}
        className="inline-flex items-center gap-[6px] px-[16px] py-[8px] text-[14px] font-medium text-white bg-[#612bd3] hover:bg-[#5023b8] rounded-[8px] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 4v6h-6M1 20v-6h6" />
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
        </svg>
        {t("refresh_channel", "Refresh Channel")}
      </button>
    </div>
  )
}

export const RenderAnalytics: FC<{
  integration: Integration
  date: number
}> = (props) => {
  const { integration, date } = props
  const fetch = useFetch()
  const user = useUser()
  const onFreePlan = user.tier.current == "FREE" && !user.trialActive
  const t = useT()
  const router = useRouter()

  const load = useCallback(async () => {
    return (await fetch(`/analytics/${integration.id}?date=${date}`)).json()
  }, [integration, date])

  const { data, isLoading } = useSWR(onFreePlan ? null : `/analytics-${integration?.id}-${date}`, load, {
    refreshInterval: 0,
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    revalidateOnMount: true,
  })

  const mockData: AnalyticsDataItem[] = useMemo(() => {
    const points = Math.max(7, Math.min(date || 7, 30))
    const buildSeries = (seed: number) =>
      Array.from({ length: points }, (_, index) => {
        const dayIndex = points - 1 - index
        const base = seed * 120
        const wave = Math.sin((index + seed) * 0.6) * (seed * 8)
        const trend = index * seed * 4
        const total = Math.max(0, Math.round(base + wave + trend))
        return {
          total,
          date: new Date(Date.now() - dayIndex * 24 * 60 * 60 * 1000).toISOString(),
        }
      })

    if ((integration as any)?.identifier === "linkedin") {
      return [
        {
          label: "Total engagement",
          data: buildSeries(7),
          percentageChange: 12.4,
        },
        {
          label: "Total reactions",
          data: buildSeries(5),
          percentageChange: 6.8,
        },
        {
          label: "Total comments",
          data: buildSeries(2),
          percentageChange: -1.6,
        },
      ]
    }

    const engagementSeries = buildSeries(3).map((item) => ({
      ...item,
      total: Math.max(0, Number(((item.total % 40) + 3).toFixed(2))),
    }))

    return [
      {
        label: t("impressions", "Impressions"),
        data: buildSeries(7),
        percentageChange: 12.4,
      },
      {
        label: t("engagement_rate", "Engagement Rate"),
        data: engagementSeries,
        average: true,
        percentageChange: -1.6,
      },
      {
        label: t("new_followers", "New Followers"),
        data: buildSeries(5),
        percentageChange: 6.8,
      },
    ]
  }, [date, t])

  const dataToRender = onFreePlan ? mockData : data

  const refreshChannel = useCallback(
    (
        integrationData: Integration & {
          identifier: string
        },
      ) =>
      async () => {
        const { url } = await (
          await fetch(`/integrations/social/${integrationData.identifier}?refresh=${integrationData.internalId}`, {
            method: "GET",
          })
        ).json()
        window.location.href = url
      },
    [],
  )

  const totals = useMemo(() => {
    return dataToRender?.map((p: AnalyticsDataItem) => {
      if (typeof p.total !== "undefined") {
        return typeof p.total === "number" ? new Intl.NumberFormat().format(p.total) : p.total
      }
      const value =
        (p?.data.reduce((acc: number, curr: { total: number | string }) => acc + toNumber(curr.total), 0) || 0) / (p.average ? p.data.length : 1)
      if (p.average) {
        return value.toFixed(2) + "%"
      }
      return new Intl.NumberFormat().format(Math.round(value))
    })
  }, [dataToRender])

  if (!onFreePlan && isLoading) {
    return (
      <div className="flex items-center justify-center py-[48px]">
        <LoadingComponent />
      </div>
    )
  }

  return (
    <div className="relative">
      {!onFreePlan && (integration as any)?.identifier === "linkedin" && dataToRender?.length > 0 ? (
        <LinkedinAnalyticsView data={dataToRender} />
      ) : (
        <div className={clsx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]", onFreePlan && "blur-sm pointer-events-none select-none")}>
          {!onFreePlan && dataToRender?.length === 0 && <EmptyState onRefresh={refreshChannel(integration as any)} />}
          {dataToRender?.map((item: AnalyticsDataItem, index: number) => (
            <AnalyticsCard key={`analytics-${index}`} item={item} total={totals?.[index]} index={index} />
          ))}
        </div>
      )}
      {onFreePlan && (
        <div className="absolute inset-0 flex items-start justify-center pt-[64px]">
          <div className="bg-newBgColorInner border border-newTableBorder rounded-[12px] px-[24px] py-[20px] text-center max-w-[420px] shadow-lg">
            <div className="text-[20px] font-semibold mb-[6px]">{t("upgrade_to_view_analytics", "Upgrade to Pro to view analytics")}</div>
            <div className="text-[14px] text-newTableText mb-[16px]">
              {t("trial_analytics_cta", "Unlock full analytics, trends, and performance breakdowns.")}
            </div>
            <div className="flex justify-center">
              <Button onClick={() => router.push("/billing")}>{t("upgrade_to_pro", "Upgrade to Pro")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
