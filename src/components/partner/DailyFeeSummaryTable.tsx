"use client"

import * as XLSX from "xlsx"

const formatCurrency = (v: number) =>
  `Rp ${v.toLocaleString("id-ID")}`

const PARTNER_SHARE = 0.75

export const DailyFeeSummaryTable = ({
  rows,
  partnerShare,
  qrisFeeRate,
  agentComissionRate,
}: {
  rows: any[]
  partnerShare: number
  qrisFeeRate: number
  agentComissionRate: number
}) => {
  const map = new Map<string, any>()

  rows.forEach(r => {
    const date = r.created_at.split("T")[0]
    const key = `${date}_${r.platform_name}`

    const curr = map.get(key) || {
      date,
      platform: r.platform_name,
      tx: 0,
      amount: 0,
      grossFee: 0,
      qrisFee: 0,
      agentCommissionFee: 0,
      platformFee: 0,
      cleanFee: 0,
    }

    const grossFee = r.agent_fee + r.platform_fee
    const qrisFee = r.transaction_amount * qrisFeeRate

    const agentCommissionFee =
      r.transaction_amount *
        (r.agent_commission_fee && r.agent_commission_fee > 0
          ? r.agent_commission_fee
          : agentComissionRate) /
        100 || 0

    const platformFee = r.platform_fee

    const cleanFee = grossFee - qrisFee - agentCommissionFee - platformFee

    curr.tx += 1
    curr.amount += r.transaction_amount

    curr.grossFee += grossFee
    curr.qrisFee += qrisFee
    curr.agentCommissionFee += agentCommissionFee
    curr.platformFee += platformFee
    curr.cleanFee += cleanFee

    map.set(key, curr)
  })


  const data = Array.from(map.values()).sort(
    (a, b) => b.date.localeCompare(a.date)
  )

  /* =============================
   * EXPORT HANDLERS
   * ============================= */

  const buildExportRows = () =>
    data.map(d => ({
      Date: d.date,
      Transactions: d.tx,
      "Transaction Amount": d.amount,
      "Platform": d.platform,

      // "Gross Fee": d.grossFee,
      // "QRIS Fee": d.qrisFee,
      // "Agent Commission Fee": d.agentCommissionFee,
      // "Platform Fee": d.platformFee,

      "Clean Fee": d.cleanFee,
      [`Partner Share (${partnerShare * 100}%)`]:
        d.cleanFee * partnerShare,

      Status: "Settled",
    }))


  const exportCSV = () => {
    const rows = buildExportRows()
    const header = Object.keys(rows[0]).join(",")
    const body = rows
      .map(r =>
        Object.values(r)
          .map(v => `"${v}"`)
          .join(",")
      )
      .join("\n")

    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "daily-fee-summary.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      buildExportRows()
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Daily Fee Summary"
    )

    XLSX.writeFile(workbook, "daily-fee-summary.xlsx")
  }

  const exportAllRowsCSV = () => {
    if (!rows.length) return

    const header = Object.keys(rows[0]).join(",")

    const body = rows
      .map(r =>
        Object.values(r)
          .map(v => `"${v ?? ""}"`)
          .join(",")
      )
      .join("\n")

    const blob = new Blob([`${header}\n${body}`], {
      type: "text/csv;charset=utf-8;",
    })

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "all-transactions.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">

      {/* ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
        <button
          onClick={exportCSV}
          className="w-full sm:w-auto px-3 py-2 text-sm border rounded-md hover:bg-slate-50"
        >
          Export CSV
        </button>

        <button
          onClick={exportExcel}
          className="w-full sm:w-auto px-3 py-2 text-sm border rounded-md hover:bg-slate-50"
        >
          Export Excel
        </button>
        <button
          onClick={exportAllRowsCSV}
          className="w-full sm:w-auto px-3 py-2 text-sm border rounded-md hover:bg-slate-50"
        >
          Export All Transactions
        </button>
      </div>


      {/* TABLE */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <table className="w-full text-sm">
            <thead className="border-b text-slate-500">
              <tr>
                <th className="text-left py-4 px-3 min-w-[120px] whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-3">Platform</th>
                <th className="text-right px-2">Transactions</th>
                <th className="text-right px-2">Transaction Amount</th>
                <th className="text-right px-2">Total Fees</th>
                <th className="text-right px-2">{`Partner Earnings (${partnerShare * 100}%)`}</th>
              </tr>
            </thead>

            <tbody>
              {data.map(d => (
                <tr
                  key={`${d.date}-${d.platform}`}
                  className="border-b last:border-0"
                >
                  <td className="py-4 px-3 min-w-[120px] whitespace-nowrap">
                    {d.date}
                  </td>
                  <td className="text-right px-2 whitespace-nowrap">
                    {d.platform}
                  </td>
                  <td className="text-right px-2">
                    {d.tx}
                  </td>

                  <td className="text-right px-2 whitespace-nowrap">
                    {formatCurrency(d.amount)}
                  </td>

                  <td className="text-right px-2 whitespace-nowrap">
                    {formatCurrency(d.cleanFee)}
                  </td>

                  <td className="text-right px-2 font-semibold text-violet-600 whitespace-nowrap">
                    {formatCurrency(d.cleanFee * PARTNER_SHARE)}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  )
}
