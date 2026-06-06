import { FC, useCallback, useMemo } from "react"
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
  label: string
  data: Array<{ total: number; date: string; label?: string }>
  average?: boolean
  percentageChange?: number
  chartType?: "line" | "bar" | "horizontalBar" | "doughnut"
  total?: string | number
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
  const original = item.data.find((row) => (row.label || row.date).toLowerCase() === "original")?.total || 0
  const reshared = item.data.find((row) => (row.label || row.date).toLowerCase() === "reshared")?.total || 0
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
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{original}</div>
          <div className="mt-[2px] text-[12px] text-textItemBlur">{originalPercent.toFixed(0)}%</div>
        </div>
        <div className="ps-[14px]">
          <div className="flex items-center gap-[6px] text-[12px] text-textItemBlur">
            <span className="w-[7px] h-[7px] rounded-full bg-[#32d583]" />
            Reshared
          </div>
          <div className="mt-[4px] text-[28px] leading-[32px] font-semibold">{reshared}</div>
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
        className={clsx(`
          flex flex-col h-full
          bg-newTableHeader
          border border-newTableBorder
          rounded-[12px]
          overflow-hidden
          transition-all duration-200
          hover:border-[#612bd3]/50
        `, cardMinHeight)}
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
            <div className={clsx("flex-1 px-[16px] flex flex-col", anchorChartBottom ? "justify-end pt-[28px] pb-[18px]" : "justify-center py-[10px]")}>
              <div className={clsx("relative", chartHeight)}>
                <ChartSocial data={item.data} color={color} type={item.chartType || "line"} labelLimit={labelLimit} key={`chart-${index}`} />
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
      const value = (p?.data.reduce((acc: number, curr: { total: number }) => acc + curr.total, 0) || 0) / (p.average ? p.data.length : 1)
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
      <div className={clsx("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]", onFreePlan && "blur-sm pointer-events-none select-none")}>
        {!onFreePlan && dataToRender?.length === 0 && <EmptyState onRefresh={refreshChannel(integration as any)} />}
        {dataToRender?.map((item: AnalyticsDataItem, index: number) => (
          <AnalyticsCard key={`analytics-${index}`} item={item} total={totals?.[index]} index={index} />
        ))}
      </div>
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
