"use client"

import { Fragment, useMemo } from "react"
import { GroupedTransactionRow } from "./types"
import { cn } from "@/lib/utils"

interface Props {
  rows: GroupedTransactionRow[]
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))

const INTENSITY = [
  "bg-emerald-50",
  "bg-emerald-100",
  "bg-emerald-200",
  "bg-emerald-300",
  "bg-emerald-400",
  "bg-emerald-500",
  "bg-emerald-600",
  "bg-emerald-700",
]

export const HourlyTransactionHeatmap = ({ rows }: Props) => {
  const { matrix, max } = useMemo(() => {
    const map = Array.from({ length: 7 }, () => Array(24).fill(0))
    rows.forEach(r => {
      const d = new Date(r.created_at)
      const day = (d.getDay() + 6) % 7
      const hour = d.getHours()
      map[day][hour]++
    })
    return { matrix: map, max: Math.max(...map.flat(), 1) }
  }, [rows])

  const getColor = (v: number) => {
    const idx = Math.floor((v / max) * (INTENSITY.length - 1))
    return INTENSITY[idx]
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold">Hourly Transaction Heatmap</h3>
        <p className="text-xs text-slate-500">
          Volume patterns by hour & weekday
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1 text-xs text-slate-500">
        <span>Low</span>
        {INTENSITY.map(c => (
          <div key={c} className={cn("h-3 w-4 rounded-sm border", c)} />
        ))}
        <span>High</span>
      </div>

      {/* Scroll container */}
      <div className="relative overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[80px_repeat(24,1fr)] gap-1">
            {/* Hour labels */}
            <div />
            {HOURS.map(h => (
              <div key={h} className="text-center text-[10px] text-slate-400">
                {h}
              </div>
            ))}

            {/* Heatmap rows */}
            {DAYS.map((day, dIdx) => (
              <div key={day} className="contents">
                {/* Sticky day label */}
                <div
                  className={cn(
                    "sticky left-0 z-10 bg-white text-xs font-medium px-1 py-2",
                    day === "Sat" || day === "Sun"
                      ? "text-blue-600"
                      : "text-slate-700"
                  )}
                >
                  {day}
                </div>

                {HOURS.map((_, hIdx) => {
                  const v = matrix[dIdx][hIdx]
                  return (
                    <div
                      key={`${dIdx}-${hIdx}`}
                      title={`${day} ${hIdx}:00 → ${v} tx`}
                      className={cn(
                        "h-6 rounded-sm border",
                        getColor(v),
                        "hover:ring-1 hover:ring-emerald-400"
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time blocks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 text-center text-xs text-slate-500">
        <div>00–06<br />Night</div>
        <div>06–12<br />Morning</div>
        <div>12–18<br />Afternoon</div>
        <div>18–24<br />Evening</div>
      </div>
    </div>
  )
}