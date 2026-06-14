import { FC, ReactNode, useCallback, useMemo, useState } from "react"
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

const formatPatternLabel = (value?: string) => {
  if (!value) {
    return "Not enough data"
  }

  if (["image", "text", "article", "document", "video", "multi-image"].includes(value)) {
    return formatPostFormat(value) || value
  }

  return value
}

const LINKEDIN_REACTION_LABELS: Record<string, string> = {
  Likes: "👍 Like",
  Like: "👍 Like",
  Praise: "👏 Celebrate",
  Celebrate: "👏 Celebrate",
  Empathy: "🤝 Support",
  Support: "🤝 Support",
  Appreciation: "❤️ Love",
  Love: "❤️ Love",
  Interest: "💡 Insightful",
  Insightful: "💡 Insightful",
  Entertainment: "😂 Funny",
  Funny: "😂 Funny",
  Maybe: "🤔 Maybe",
}

const formatLinkedinReactionLabel = (value?: string) => {
  if (!value) {
    return "Reaction"
  }

  return LINKEDIN_REACTION_LABELS[value] || value
}

const withLinkedinReactionLabels = (item?: AnalyticsDataItem) =>
  item
    ? {
        ...item,
        data: item.data.map((row) => {
          const label = formatLinkedinReactionLabel(row.label || row.date)
          return {
            ...row,
            label,
            date: label,
          }
        }),
      }
    : undefined

const normalizeChartData = (data: AnalyticsDataItem["data"]) =>
  data.map((row) => ({
    ...row,
    total: toNumber(row.total),
  }))

const patternConclusion = (item: AnalyticsDataItem | undefined, fallback: string) => {
  const rows = (item?.data || []).filter((row) => toNumber(row.total) > 0)
  const top = rows[0]
  const second = rows[1]

  if (!top) {
    return fallback
  }

  if (second && toNumber(top.total) > toNumber(second.total)) {
    return `${formatPatternLabel(top.label || top.date)} outperforms ${formatPatternLabel(second.label || second.date)}`
  }

  return `${formatPatternLabel(top.label || top.date)} performs best`
}

const totalSamples = (item?: AnalyticsDataItem) => (item?.data || []).reduce((sum, row) => sum + toNumber(row.count), 0)

const periodComparisonSparklineData = (data?: AnalyticsDataItem["data"]) => {
  const points = normalizeChartData(data || [])

  if (points.length < 2) {
    return points
  }

  const firstHalf = points.slice(0, Math.max(1, Math.floor(points.length / 2)))
  const secondHalf = points.slice(Math.max(1, Math.floor(points.length / 2)))
  const average = (items: typeof points) => items.reduce((sum, point) => sum + toNumber(point.total), 0) / Math.max(items.length, 1)

  return [
    { date: "Earlier period", total: average(firstHalf) },
    { date: "Recent period", total: average(secondHalf) },
  ]
}

const MiniSparkline: FC<{ data?: AnalyticsDataItem["data"]; accent?: "purple" | "green" | "blue" | "orange" | "red" | "gray" }> = ({
  data = [],
  accent = "purple",
}) => {
  const points = normalizeChartData(data).slice(-12)

  if (points.length < 2) {
    return null
  }

  const values = points.map((point) => toNumber(point.total))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const width = 112
  const height = 34
  const color = {
    purple: "#612bd3",
    green: "#32d583",
    blue: "#1d9bf0",
    orange: "#f79009",
    red: "#f04438",
    gray: "#98a2b3",
  }[accent]
  const path = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - ((value - min) / range) * height
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg className="h-[34px] w-[112px] shrink-0 overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend sparkline">
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
          <div className="flex items-center gap-[6px] text-[12px] text-newTableText/70">
            <span className="w-[7px] h-[7px] rounded-full bg-[#612bd3]" />
            Original
          </div>
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{formatNumber(original)}</div>
          <div className="mt-[2px] text-[12px] text-newTableText/70">{originalPercent.toFixed(0)}%</div>
        </div>
        <div className="ps-[14px]">
          <div className="flex items-center gap-[6px] text-[12px] text-newTableText/70">
            <span className="w-[7px] h-[7px] rounded-full bg-[#32d583]" />
            Reshared
          </div>
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{formatNumber(reshared)}</div>
          <div className="mt-[2px] text-[12px] text-newTableText/70">{resharedPercent.toFixed(0)}%</div>
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
  accent?: "purple" | "green" | "blue" | "orange" | "red" | "gray"
  sparklineData?: AnalyticsDataItem["data"]
}> = ({ label, value, detail, accent = "purple", sparklineData }) => {
  const accentClass = {
    purple: "bg-[#612bd3]",
    green: "bg-[#32d583]",
    blue: "bg-[#1d9bf0]",
    orange: "bg-[#f79009]",
    red: "bg-[#f04438]",
    gray: "bg-[#98a2b3]",
  }[accent]

  return (
    <div className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div>
          <div className="flex items-center gap-[8px] text-[13px] font-medium text-newTableText/75">
            <span className={clsx("h-[7px] w-[7px] rounded-full", accentClass)} />
            {label}
          </div>
          <div className="mt-[10px] text-[28px] leading-[34px] font-semibold text-newTableText">{value}</div>
        </div>
        <MiniSparkline data={sparklineData} accent={accent} />
      </div>
      {detail && <div className="mt-[8px] text-[12px] leading-[19px] text-newTableText/70">{detail}</div>}
    </div>
  )
}

const ConfidenceBadge: FC<{ value?: string; samples?: number }> = ({ value, samples }) => {
  if (!value) {
    return null
  }

  const className =
    value === "High"
      ? "border-[#32d583]/25 bg-[#32d583]/10 text-[#0f9f5f]"
      : value === "Medium"
      ? "border-[#f79009]/20 bg-[#fff7ed] text-[#b54708]"
      : "border-newTableBorder bg-newBgColorInner text-newTableText/70"

  return (
    <span
      className={clsx("inline-flex h-[24px] shrink-0 items-center rounded-full border px-[9px] text-[11px] font-semibold leading-none", className)}
    >
      {value} confidence{samples ? ` · ${samples} samples` : ""}
    </span>
  )
}

const PatternCard: FC<{ item?: AnalyticsDataItem; title: string; type?: "bar" | "horizontalBar" }> = ({ item, title, type = "bar" }) => {
  const [showDetails, setShowDetails] = useState(true)

  if (!item) {
    return null
  }

  const topRows = (item.data || []).slice(0, 3)
  const samples = totalSamples(item)

  return (
    <div className="flex h-full flex-col rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
      <div className="flex min-h-[80px] items-start justify-between gap-[16px] xl:min-h-[118px]">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold leading-[22px] text-newTableText">{title}</div>
        </div>
        <ConfidenceBadge value={item.confidence} samples={samples} />
      </div>
      <div className="h-[168px]">
        <ChartSocial
          data={normalizeChartData(item.data)}
          type={type}
          color="purple"
          labelLimit={type === "horizontalBar" ? 34 : 22}
          hideXAxisLabels={type === "bar"}
        />
      </div>
      <div className="mt-[16px] flex items-center justify-between gap-[12px]">
        {item.recommendation && (
          <div className="rounded-[8px] bg-[#612bd3]/10 px-[12px] py-[9px] text-[12px] leading-[19px] text-newTableText">{item.recommendation}</div>
        )}
        <button
          type="button"
          onClick={() => setShowDetails((current) => !current)}
          className="ml-auto shrink-0 rounded-[7px] border border-newTableBorder bg-newBgColorInner px-[9px] py-[6px] text-[12px] font-semibold text-newTableText/75 hover:text-newTableText"
        >
          {showDetails ? "Hide details" : "View details"}
        </button>
      </div>
      {showDetails && (
        <div className="mt-[14px] grid gap-[9px]">
          {topRows.map((row) => (
            <div
              key={row.label || row.date}
              className="flex items-center justify-between gap-[12px] rounded-[8px] bg-newBgColorInner px-[12px] py-[9px]"
            >
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-newTableText">{row.label || row.date}</div>
                <div className="text-[11px] text-newTableText/65">{row.count ? `${row.count} samples` : "Posts analyzed"}</div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[12px] font-semibold tabular-nums">{formatNumber(row.total)}</div>
                {typeof row.vsAverage === "number" && (
                  <div className={clsx("text-[11px]", row.vsAverage >= 0 ? "text-[#32d583]" : "text-[#f04438]")}>
                    {row.vsAverage >= 0 ? "+" : ""}
                    {row.vsAverage}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
    <div className="rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
      <div className="flex flex-col gap-[14px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="text-[17px] font-semibold text-newTableText dark:text-white">Top posts by engagement</div>
          <div className="mt-[8px] text-[13px] leading-[20px] text-newTableText/70">{item.insight}</div>
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
                sortBy === value ? "border-[#612bd3] bg-[#612bd3] text-white" : "border-newTableBorder bg-newBgColorInner text-newTableText/70",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-[18px] overflow-hidden rounded-[10px] border border-newTableBorder">
        <div className="grid grid-cols-[minmax(0,1fr)_96px_96px_88px_104px] gap-[14px] bg-newBgColorInner px-[16px] py-[12px] text-[11px] font-semibold uppercase tracking-[0.06em] text-newTableText/70">
          <div>Post</div>
          <div className="text-right">Eng.</div>
          <div className="text-right">Comments</div>
          <div className="text-right">Reposts</div>
          <div>Format</div>
        </div>
        {rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            className={clsx(
              "grid grid-cols-[minmax(0,1fr)_96px_96px_88px_104px] gap-[14px] border-t border-newTableBorder px-[16px] py-[16px] text-[13px] transition-colors hover:bg-[#612bd3]/5",
              index % 2 === 1 && "bg-newBgColorInner/50",
            )}
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold leading-[18px] text-newTableText">{row.label}</div>
              <div className="mt-[7px] truncate text-[12px] leading-[17px] text-newTableText/65">
                {row.hookStyle} · {row.publishedAt}
              </div>
            </div>
            <div className="text-right font-semibold tabular-nums text-newTableText">{formatNumber(row.total)}</div>
            <div className="text-right tabular-nums text-newTableText/75">{formatNumber(row.comments)}</div>
            <div className="text-right tabular-nums text-newTableText/75">{formatNumber(row.reposts)}</div>
            <div className="capitalize text-newTableText/70">{row.format}</div>
          </div>
        ))}
      </div>
      {item.recommendation && (
        <div className="mt-[16px] rounded-[8px] bg-[#612bd3]/10 p-[12px] text-[12px] leading-[19px] text-newTableText">{item.recommendation}</div>
      )}
    </div>
  )
}

const AnalyticsSection: FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-[16px]">
    <div className="flex items-center gap-[10px]">
      <div className="h-[1px] flex-1 bg-newTableBorder" />
      <h2 className="shrink-0 text-[13px] font-semibold uppercase tracking-[0.08em] text-newTableText/75">{title}</h2>
      <div className="h-[1px] flex-1 bg-newTableBorder" />
    </div>
    {children}
  </section>
)

const KeyTakeawaysBar: FC<{
  averageEngagement?: string | number
  bestFormat?: string
  bestTime?: string
  recommendedTopic?: string
}> = ({ averageEngagement, bestFormat, bestTime, recommendedTopic }) => {
  const items = [
    ["Avg engagement", averageEngagement || "0"],
    ["Best format", formatPatternLabel(bestFormat)],
    ["Best time", bestTime || "Not enough data"],
    ["Recommended topic", recommendedTopic || "Not enough data"],
  ]

  return (
    <div className="sticky top-0 z-20 rounded-[12px] border border-[#612bd3]/25 bg-newTableHeader/95 p-[12px] shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur">
      <div className="grid grid-cols-2 gap-[10px] lg:grid-cols-4">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[8px] bg-newBgColorInner px-[12px] py-[10px]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-newTableText/65">{label}</div>
            <div className="mt-[3px] truncate text-[13px] font-semibold text-newTableText">{value}</div>
          </div>
        ))}
      </div>
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
  const mediaPerformance = item("media_type_performance")
  const lengthPerformance = item("post_length_performance")
  const postingTimePerformance = item("posting_day_time_performance")
  const topicPerformance = item("topic_performance")
  const hookPerformance = item("hook_style_performance")
  const ctaPerformance = item("cta_style_performance")
  const originalResharedPerformance = item("original_vs_reshared_performance")
  const reactionTypeBreakdown = withLinkedinReactionLabels(item("reaction_type_breakdown"))
  const bestFormat = mediaPerformance?.data?.[0]?.label || mediaPerformance?.data?.[0]?.date
  const bestTime = postingTimePerformance?.data?.[0]?.label || postingTimePerformance?.data?.[0]?.date
  const recommendedTopic = topicPerformance?.data?.[0]?.label || topicPerformance?.data?.[0]?.date
  const trendIsPositive = (trend?.percentageChange || 0) >= 0
  const trendSparklineData = useMemo(() => periodComparisonSparklineData(trend?.data), [trend?.data])

  return (
    <div className="flex flex-col gap-[26px]">
      <KeyTakeawaysBar
        averageEngagement={overview?.meta?.averageEngagement ?? overview?.total ?? "0"}
        bestFormat={bestFormat}
        bestTime={bestTime}
        recommendedTopic={recommendedTopic}
      />

      <AnalyticsSection title="Overview">
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
          <InsightCard
            label="Average engagement"
            value={`${overview?.meta?.averageEngagement ?? overview?.total ?? "0"} / post`}
            detail={`${overview?.meta?.postsAnalyzed || 0} posts analyzed`}
            accent="blue"
          />
          <InsightCard
            label={trendIsPositive ? "Engagement is improving" : "Engagement is declining"}
            value={`${trend?.percentageChange || 0}%`}
            detail="Change between period halves"
            accent={trendIsPositive ? "green" : "red"}
            sparklineData={trendSparklineData}
          />
          <InsightCard
            label="Top post beat your average"
            value={`${bestPost?.total || 0} engagements`}
            detail={
              bestPost?.meta?.vsAverage
                ? `${bestPost.meta.vsAverage}x your average · Format: ${formatPostFormat(bestPost.meta.format)}`
                : bestPost?.meta?.format
                ? `Format: ${formatPostFormat(bestPost.meta.format)}`
                : undefined
            }
            accent="green"
          />
          <InsightCard
            label="Posting pace"
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
          <div className="rounded-[12px] border border-[#612bd3]/30 bg-[#612bd3]/10 p-[20px]">
            <div className="flex flex-col gap-[14px] lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[18px] font-semibold text-newTableText dark:text-white">
                  🧠 Based on our analysis, your next post should be...
                </div>
                <div className="mt-[10px] max-w-[820px] text-[15px] leading-[24px] text-newTableText">{nextDecision.recommendation}</div>
                <div className="mt-[10px] text-[13px] leading-[20px] text-newTableText/70">{nextDecision.meta?.why}</div>
              </div>
              <ConfidenceBadge value={nextDecision.confidence} />
            </div>
          </div>
        )}
      </AnalyticsSection>

      <AnalyticsSection title="Top Performing Content">
        <TopPostsTable item={item("top_posts_by_engagement", "Top 10 posts by engagement")} />
      </AnalyticsSection>

      <AnalyticsSection title="Optimization Opportunities">
        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-3">
          <PatternCard title={patternConclusion(mediaPerformance, "Best format needs more data")} item={mediaPerformance} />
          <PatternCard title={patternConclusion(lengthPerformance, "Best length needs more data")} item={lengthPerformance} />
          <PatternCard
            title={patternConclusion(postingTimePerformance, "Best posting time needs more data")}
            item={postingTimePerformance}
            type="horizontalBar"
          />
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-3">
          <PatternCard title={patternConclusion(topicPerformance, "Best topic needs more data")} item={topicPerformance} />
          <PatternCard title={patternConclusion(hookPerformance, "Best hook needs more data")} item={hookPerformance} />
          <PatternCard title={patternConclusion(ctaPerformance, "Best CTA needs more data")} item={ctaPerformance} />
        </div>
      </AnalyticsSection>

      <AnalyticsSection title="Audience Engagement">
        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-3">
          <InsightCard
            label="Conversation depth"
            value={`${comments?.total || 0} comments`}
            detail={`Avg ${((responseMix?.meta?.averageComments || 0) as number).toFixed(1)} comments/post`}
            accent="green"
          />
          <InsightCard
            label="Audience amplification"
            value={`${reposts?.total || 0} reposts`}
            detail={`Avg ${((responseMix?.meta?.averageReposts || 0) as number).toFixed(1)} reposts/post`}
            accent="blue"
          />
          <InsightCard
            label="Reaction volume"
            value={`${reactions?.total || 0} reactions`}
            detail={`Avg ${((responseMix?.meta?.averageReactions || 0) as number).toFixed(1)} reactions/post`}
            accent="purple"
          />
        </div>

        <div className="grid grid-cols-1 gap-[18px] xl:grid-cols-2">
          <PatternCard title="Original vs reshared avg engagement" item={originalResharedPerformance} />
          {reactionTypeBreakdown && (
            <div className="flex min-h-[360px] flex-col rounded-[12px] border border-newTableBorder bg-newTableHeader p-[18px]">
              <div className="text-[15px] font-semibold text-newTableText">Detailed reaction breakdown</div>
              <div className="mt-[8px] text-[13px] leading-[20px] text-newTableText/70">Reaction mix across your analyzed posts.</div>
              <div className="flex flex-1 items-center justify-center py-[24px]">
                <div className="h-[230px] w-full">
                  <ChartSocial data={normalizeChartData(reactionTypeBreakdown.data)} type="doughnut" color="blue" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-[8px] border-t border-newTableBorder pt-[14px] sm:grid-cols-3">
                {reactionTypeBreakdown.data.map((row) => (
                  <div
                    key={row.label || row.date}
                    className="flex items-center justify-between gap-[8px] rounded-[8px] bg-newBgColorInner px-[10px] py-[8px]"
                  >
                    <span className="truncate text-[12px] font-semibold text-newTableText">{row.label || row.date}</span>
                    <span className="shrink-0 text-[12px] tabular-nums text-newTableText/70">{formatNumber(row.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AnalyticsSection>
    </div>
  )
}

const EmptyState: FC<{ integration: Integration; date: number; onRefresh: () => void }> = ({ integration, date, onRefresh }) => {
  const t = useT()
  const identifier = (integration as any)?.identifier
  const shouldShowNoPostData = ["linkedin", "linkedin-page", "x"].includes(identifier) && !(integration as any)?.refreshNeeded
  const dateLabel =
    date === -1
      ? t("latest_50_posts", "latest 50 posts")
      : t("last_n_days", "last {{days}} days", {
          days: date,
        })

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-[48px] px-[24px] bg-newTableHeader border border-newTableBorder rounded-[12px]">
      <div className="w-[48px] h-[48px] mb-[16px] rounded-full bg-[#612bd3]/10 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#612bd3]">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path d="M12 8v4l2 2" />
        </svg>
      </div>
      {shouldShowNoPostData && (
        <div className="mb-[6px] text-[18px] font-semibold text-newTextColor">{t("no_post_data_available", "No post data available")}</div>
      )}
      <p className="text-[15px] text-newTableText text-center mb-[12px]">
        {shouldShowNoPostData
          ? t("no_post_related_data_for_range", "No post-related data available for {{dateLabel}}.", {
              dateLabel,
            })
          : t("this_channel_needs_to_be_refreshed", "This channel needs to be refreshed to display analytics")}
      </p>
      {shouldShowNoPostData ? (
        <div className="max-w-[520px] text-center text-[13px] leading-[19px] text-newTableText/70">
          {t("try_wider_date_range_or_publish_more", "Try a wider date range or publish more posts to see analytics here.")}
        </div>
      ) : (
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
      )}
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
          {!onFreePlan && dataToRender?.length === 0 && (
            <EmptyState integration={integration} date={date} onRefresh={refreshChannel(integration as any)} />
          )}
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
