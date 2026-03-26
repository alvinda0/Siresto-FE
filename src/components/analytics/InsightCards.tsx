"use client"

import {
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InsightCardProps {
  icon: React.ReactNode
  title: string
  description: string
  accent: string
}

const InsightCard = ({
  icon,
  title,
  description,
  accent,
}: InsightCardProps) => (
  <Card
    className={cn(
      "flex items-start gap-4 p-5 rounded-xl border",
      "bg-white dark:bg-slate-900",
      "shadow-sm"
    )}
  >
    <div
      className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center",
        accent
      )}
    >
      {icon}
    </div>

    <div>
      <h4 className="text-sm font-semibold">
        {title}
      </h4>
      <p className="text-xs text-slate-500 mt-1">
        {description}
      </p>
    </div>
  </Card>
)

export const InsightCards = ({
  peakHour,
  peakVolume,
  topPlatformShare,
  growthLeader,
}: {
  peakHour: number
  peakVolume: number
  topPlatformShare: number
  growthLeader: string
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <InsightCard
      icon={<Clock className="h-5 w-5 text-emerald-700" />}
      title="Peak Activity"
      description={`Peak hour detected at ${String(
        peakHour
      ).padStart(2, "0")}:00 with ${peakVolume} avg transactions`}
      accent="bg-emerald-100"
    />

    <InsightCard
      icon={<Zap className="h-5 w-5 text-blue-700" />}
      title="Top Platforms"
      description={`Top 3 platforms contribute ${topPlatformShare.toFixed(
        2
      )}% of total volume`}
      accent="bg-blue-100"
    />

    <InsightCard
      icon={<TrendingUp className="h-5 w-5 text-purple-700" />}
      title="Growth Leader"
      description={`${growthLeader} leads with highest growth rate`}
      accent="bg-purple-100"
    />
  </div>
)
