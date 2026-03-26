"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Item {
  name: string
  volume: number
  amount: number
//   growth: number
}

interface Props {
  title: string
  subtitle: string
  items: Item[]
  color: string
}

export const TopPerformanceList = ({
  title,
  subtitle,
  items,
  color,
}: Props) => {
  const max = Math.max(...items.map(i => i.volume), 1)

  return (
    <Card className="p-5 space-y-4 rounded-xl">
      <div>
        <h3 className="text-sm font-semibold">
          {title}
        </h3>
        <p className="text-xs text-slate-500">
          {subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {items.map((i, idx) => (
          <div key={i.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-medium">
                <span
                  className={cn(
                    "h-6 w-6 rounded-full text-xs flex items-center justify-center text-white",
                    color
                  )}
                >
                  {idx + 1}
                </span>
                {i.name}
              </div>

              <span className="font-semibold">
                {i.volume.toLocaleString()}
              </span>
            </div>

            <div className="h-2 rounded bg-slate-100 overflow-hidden">
              <div
                className={cn("h-full rounded", color)}
                style={{
                  width: `${(i.volume / max) * 100}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Rp {i.amount.toLocaleString()}
              </span>
              {/* <span className="text-emerald-600">
                ↗ {i.growth.toFixed(2)}%
              </span> */}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
