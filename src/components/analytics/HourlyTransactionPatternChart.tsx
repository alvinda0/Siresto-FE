"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { useMemo } from "react"
import { GroupedTransactionRow } from "./types"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface Props {
  rows: GroupedTransactionRow[]
}

export const HourlyTransactionPatternChart = ({ rows }: Props) => {
  const { labels, avgVolume, successRate } = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const map = new Map<
      number,
      { total: number; paid: number }
    >()

    rows.forEach(r => {
      const hour = new Date(r.created_at).getHours()
      const curr = map.get(hour) || { total: 0, paid: 0 }

      curr.total += 1
      if (r.status.toLowerCase() === "paid") {
        curr.paid += 1
      }

      map.set(hour, curr)
    })

    return {
      labels: hours.map(h => `${String(h).padStart(2, "0")}:00`),
      avgVolume: hours.map(h => map.get(h)?.total || 0),
      successRate: hours.map(h => {
        const d = map.get(h)
        if (!d || d.total === 0) return 0
        return Number(((d.paid / d.total) * 100).toFixed(2))
      }),
    }
  }, [rows])

  const data = {
    labels,
    datasets: [
      {
        label: "Avg Volume",
        data: avgVolume,
        borderColor: "#0ea5e9",
        backgroundColor: "rgba(14,165,233,0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        yAxisID: "y",
      },
      {
        label: "Success Rate (%)",
        data: successRate,
        borderColor: "#22c55e",
        backgroundColor: "#22c55e",
        tension: 0.35,
        pointRadius: 3,
        yAxisID: "y1",
      },
    ],
  }

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx =>
            ctx.dataset.label?.includes("%")
              ? `${ctx.parsed.y}%`
              : `${ctx.parsed.y} tx`,
        },
      },
    },

    scales: {
      y: {
        type: "linear",
        beginAtZero: true,

        title: {
          display: true,
          text: "Transactions",
        },

        ticks: {
          stepSize: 45,
        },

        border: {
          display: false, // ✅ CORRECT LOCATION
        },
      },

      y1: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        max: 100,

        title: {
          display: true,
          text: "Success Rate",
        },

        ticks: {
          callback: v => `${v}%`,
        },

        grid: {
          drawOnChartArea: false, // ✅ still belongs to grid
        },
      },
    },
  }


  return (
    <div className="h-[340px]">
      <Line data={data} options={options} />
    </div>
  )
}
