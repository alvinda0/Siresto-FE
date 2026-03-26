import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Tone = "default" | "success" | "warning" | "danger"

interface SummaryCardProps {
  title: string
  amount: string | number
  tone?: Tone
}

const toneAccent: Record<Tone, string> = {
  default: "bg-slate-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
}

export const SummaryCard = ({
  title,
  amount,
  tone = "default",
}: SummaryCardProps) => {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-xl border",
        "bg-white dark:bg-slate-900",
        "transition-all duration-200",
        "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Top accent line (very subtle) */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-[2px]",
          toneAccent[tone]
        )}
      />

      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </h3>

          {/* Tiny status dot */}
          <span
            className={cn(
              "h-2 w-2 rounded-full opacity-60",
              toneAccent[tone]
            )}
          />
        </div>

        <div className="mt-3 lg:text-lg md:text-xl text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {amount}
        </div>
      </div>
    </Card>
  )
}
