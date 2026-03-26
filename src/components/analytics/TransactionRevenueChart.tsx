"use client"

import {
  Chart as ChartJS,
  ChartOptions,
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

export const TransactionRevenueChart = ({ rows }: Props) => {
  const daily = useMemo(() => {
    const map = new Map<string, { amount: number; volume: number }>()

    rows.forEach(r => {
      const day = r.created_at.split("T")[0]
      const curr = map.get(day) || { amount: 0, volume: 0 }
      curr.amount += r.transaction_final_amount
      curr.volume += 1
      map.set(day, curr)
    })

    return Array.from(map.entries()).sort()
  }, [rows])

  const labels = daily.map(([d]) => d)
  const amountData = daily.map(([, v]) => v.amount)
  const volumeData = daily.map(([, v]) => v.volume)

  const data = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "Total Transaction (Rp)",
        data: amountData,
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        tension: 0.35,
        yAxisID: "y",
      },
      {
        type: "bar" as const,
        label: "Volume",
        data: volumeData,
        backgroundColor: "#10b981",
        yAxisID: "y1",
        borderRadius: 6,
      },
    ],
  }


  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    scales: {
      y: {
        type: "linear",        // ✅ REQUIRED
        position: "left",

        ticks: {
          callback: v => `Rp ${Number(v).toLocaleString()}`,
        },

        border: {
          display: false,      // ✅ replaces grid.drawBorder
        },
      },

      y1: {
        type: "linear",        // ✅ REQUIRED
        position: "right",

        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }


  return (
    <div className="h-[360px]">
      <Chart type="bar" data={data} options={options} />
    </div>
  )
}
