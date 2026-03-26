import { Card } from "@/components/ui/card"

interface SummaryCardProps {
  title: string
  name?: string
  amount: number
  agentFee: number
  platformFee: number
}

export const SummaryDailyCard = ({ title, name, amount, agentFee, platformFee }: SummaryCardProps) => {
  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n)

  return (
    <div>
      <h3 className="text-sm ">{title} : {name}</h3>
      <h3 className="text-sm font-bold">Total Amount: {formatCurrency(amount)} | Agent Fee: {formatCurrency(agentFee)} | Platform Fee: {formatCurrency(platformFee)}</h3>
    </div>
  )
}
