"use client"

import { FC, useEffect, useMemo, useRef } from "react"
import DrawChart from "chart.js/auto"
import { TotalList } from "@gitroom/frontend/components/analytics/stars.and.forks.interface"
import { chunk } from "lodash"
import useCookie from "react-use-cookie"

function mergeDataPoints(data: TotalList[], numPoints: number): TotalList[] {
  const res = chunk(data, Math.ceil(data.length / numPoints))
  return res.map((row) => {
    return {
      date: `${row[0].date} - ${row?.at(-1)?.date}`,
      total: row.reduce((acc, curr) => acc + curr.total, 0),
    }
  })
}

export const ChartSocial: FC<{
  data: TotalList[]
  color?: "purple" | "green" | "blue"
  type?: "line" | "bar" | "horizontalBar" | "doughnut"
  labelLimit?: number
}> = (props) => {
  const { data, color = "purple", type = "line", labelLimit } = props
  const [mode] = useCookie("mode", "light")
  const list = useMemo(() => {
    if (type !== "line") {
      return data
    }
    return mergeDataPoints(data, 7)
  }, [data, type])
  const ref = useRef<any>(null)
  const chart = useRef<null | DrawChart>(null)

  const colorSchemes = {
    purple: {
      start: "rgba(97, 43, 211, 0.8)",
      end: "rgba(97, 43, 211, 0.1)",
      border: "rgb(97, 43, 211)",
    },
    green: {
      start: "rgba(50, 213, 131, 0.8)",
      end: "rgba(50, 213, 131, 0.1)",
      border: "rgb(50, 213, 131)",
    },
    blue: {
      start: "rgba(29, 155, 240, 0.8)",
      end: "rgba(29, 155, 240, 0.1)",
      border: "rgb(29, 155, 240)",
    },
  }

  const colors = colorSchemes[color]

  useEffect(() => {
    const ctx = ref.current.getContext("2d")
    const gradient = ctx.createLinearGradient(0, 0, 0, ref.current.height)
    gradient.addColorStop(0, colors.start)
    gradient.addColorStop(1, colors.end)

    const isLine = type === "line"
    const isDoughnut = type === "doughnut"
    const isHorizontalBar = type === "horizontalBar"
    const shortenLabel = (value: unknown) => {
      const label = String(value || "")
      const limit = labelLimit || (isHorizontalBar ? 54 : 18)
      return label.length > limit ? `${label.slice(0, limit - 1)}...` : label
    }
    const categoryLabel = function (this: any, value: unknown) {
      return shortenLabel(this.getLabelForValue(Number(value)))
    }
    const chartColors = [
      colors.border,
      "rgb(50, 213, 131)",
      "rgb(29, 155, 240)",
      "rgb(247, 144, 9)",
      "rgb(240, 68, 56)",
      "rgb(20, 184, 166)",
      "rgb(168, 85, 247)",
      "rgb(236, 72, 153)",
      "rgb(132, 204, 22)",
      "rgb(99, 102, 241)",
    ]

    chart.current = new DrawChart(ref.current!, {
      type: isDoughnut ? "doughnut" : isLine ? "line" : "bar",
      options: {
        maintainAspectRatio: false,
        responsive: true,
        ...(isHorizontalBar ? { indexAxis: "y" as const } : {}),
        animation: {
          duration: 750,
          easing: "easeOutQuart",
        },
        interaction: {
          mode: isHorizontalBar ? "nearest" : "index",
          intersect: false,
          axis: isHorizontalBar ? "y" : "x",
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 4,
            bottom: 0,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            display: !isDoughnut && !isLine,
            ticks: {
              callback: isHorizontalBar ? categoryLabel : undefined,
              autoSkip: false,
              font: {
                size: 11,
              },
            },
          },
          x: {
            display: !isDoughnut && !isLine,
            ticks: {
              callback: isHorizontalBar ? undefined : categoryLabel,
              stepSize: 10,
              maxTicksLimit: 7,
              font: {
                size: 11,
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: isHorizontalBar ? "nearest" : "index",
            intersect: false,
            axis: isHorizontalBar ? "y" : "x",
            backgroundColor: mode === "dark" ? "#1e1d1d" : "#fff",
            titleColor: mode === "dark" ? "#fff" : "#000",
            bodyColor: mode === "dark" ? "#9c9c9c" : "#777",
            borderColor: mode === "dark" ? "#2b2b2b" : "#e7e9eb",
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
            displayColors: !isDoughnut,
            titleFont: {
              size: 12,
              weight: "normal",
            },
            bodyFont: {
              size: 14,
              weight: "bold",
            },
            callbacks: {
              title: (items: any[]) => {
                const item = items[0]
                return item?.label || ""
              },
              label: (item: any) => {
                const value = Number(item.raw || 0)
                return `${item.dataset.label}: ${new Intl.NumberFormat().format(value)}`
              },
            },
          },
        },
      },
      data: {
        labels: list.map((row: any) => row.label || row.date),
        datasets: [
          {
            borderColor: isLine ? colors.border : chartColors,
            borderWidth: isLine ? 2 : 0,
            label: "Total",
            backgroundColor: isLine ? gradient : chartColors,
            fill: isLine,
            data: list.map((row) => Number(row.total) || 0),
            hoverBorderWidth: isLine ? 2 : 1,
            hoverBorderColor: mode === "dark" ? "#fff" : "#1e1d1d",
            ...(isLine
              ? {
                  tension: 0.4,
                  pointRadius: 0,
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: colors.border,
                  pointHoverBorderColor: mode === "dark" ? "#1e1d1d" : "#fff",
                  pointHoverBorderWidth: 2,
                }
              : {}),
          },
        ],
      },
    })
    return () => {
      chart?.current?.destroy()
    }
  }, [colors.border, colors.end, colors.start, labelLimit, list, mode, type])

  return <canvas className="w-full h-full" ref={ref} />
}
