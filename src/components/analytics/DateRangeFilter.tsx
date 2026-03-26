import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Props {
  start: string
  end: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
}

/* =============================
 * HELPERS (LOCAL TIME)
 * ============================= */
const pad = (n: number) => n.toString().padStart(2, "0")

const formatDateTimeLocal = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`

const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

const endOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/* =============================
 * COMPONENT
 * ============================= */
export const DateRangeFilter = ({
  start,
  end,
  onStartChange,
  onEndChange,
}: Props) => {
  const [preset, setPreset] = useState<
    "1d" | "7d" | "30d" | "1y" | "custom"
  >("custom")


  useEffect(() => {
    const now = new Date()
    onStartChange(formatDateTimeLocal(startOfDay(now)))
    onEndChange(formatDateTimeLocal(endOfDay(now)))
    setPreset("1d")
  }, [])

  const setToday = () => {
    const now = new Date()
    onStartChange(formatDateTimeLocal(startOfDay(now)))
    onEndChange(formatDateTimeLocal(endOfDay(now)))
    setPreset("1d")
  }

  const setLast7Days = () => {
    const now = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 6)

    onStartChange(formatDateTimeLocal(startOfDay(start)))
    onEndChange(formatDateTimeLocal(endOfDay(now)))
    setPreset("7d")
  }
  
  const setLast30Days = () => {
    const now = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    onStartChange(formatDateTimeLocal(startOfDay(start)))
    onEndChange(formatDateTimeLocal(endOfDay(now)))
    setPreset("30d")
  }

  const setLast1Year = () => {
    const now = new Date()
    const start = new Date()
    start.setFullYear(start.getFullYear() - 1)

    onStartChange(formatDateTimeLocal(startOfDay(start)))
    onEndChange(formatDateTimeLocal(endOfDay(now)))
    setPreset("1y")
  }


  return (
    <div className="w-full gap-3">
      {/* QUICK PRESETS */}
      <div className="flex gap-2 flex-col md:flex-row ">
        <Button
          size="sm"
          variant={preset === "1d" ? "default" : "outline"}
          onClick={setToday}
        >
          1 Day
        </Button>

        <Button
          size="sm"
          variant={preset === "7d" ? "default" : "outline"}
          onClick={setLast7Days}
        >
          7 Days
        </Button>

        <Button
          size="sm"
          variant={preset === "30d" ? "default" : "outline"}
          onClick={setLast30Days}
        >
          30 Days
        </Button>

        <Button
          size="sm"
          variant={preset === "1y" ? "default" : "outline"}
          onClick={setLast1Year}
        >
          1 Year
        </Button>

        <Label className="text-xs">Start</Label>
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => {
            onStartChange(e.target.value)
            setPreset("custom")
          }}
          className="border px-2 py-1 rounded-md text-sm"
        />

        <Label className="text-xs">End</Label>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => {
            onEndChange(e.target.value)
            setPreset("custom")
          }}
          className="border px-2 py-1 rounded-md text-sm"
        />
      </div>

    </div>
  )
}
