"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Chart } from "react-chartjs-2"
import { useMemo } from "react"
import { GroupedTransactionRow } from "./types"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

interface Props {
  rows: GroupedTransactionRow[]
}

export const GrowthVelocityChart = ({ rows }: Props) => {
  const { labels, growth, acceleration } = useMemo(() => {
    const dailyCount = new Map<string, number>()

    rows.forEach(r => {
      const day = r.created_at.split("T")[0]
      dailyCount.set(day, (dailyCount.get(day) || 0) + 1)
    })

    const days = Array.from(dailyCount.entries()).sort()
    const labels: string[] = []
    const growth: number[] = []
    const acceleration: number[] = []

    for (let i = 0; i < days.length; i++) {
      labels.push(days[i][0])

      if (i === 0) {
        growth.push(0)
        acceleration.push(0)
        continue
      }

      const prev = days[i - 1][1]
      const curr = days[i][1]

      const g = prev ? ((curr - prev) / prev) * 100 : 0
      const prevGrowth = growth[i - 1] || 0

      growth.push(Number(g.toFixed(2)))
      acceleration.push(Number((g - prevGrowth).toFixed(2)))
    }

    return { labels, growth, acceleration }
  }, [rows])

  const data = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "Volume Growth (%)",
        data: growth,
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.4,
      },
      {
        type: "bar" as const,
        label: "Acceleration",
        data: acceleration,
        backgroundColor: "#f97316",
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { callback: (v: any) => `${v}%` },
      },
    },
  }

  return (
    <div className="h-[360px]">
      <Chart
        type="bar"     // ✅ REQUIRED
        data={data}
        options={options}
      />
    </div>
  )
}
