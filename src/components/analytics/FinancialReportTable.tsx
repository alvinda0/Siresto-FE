"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useMemo } from "react";
import * as XLSX from "xlsx";
import { GroupedTransactionRow, FinancialRow } from "./types";

interface Props {
  rows: GroupedTransactionRow[]
  loading: boolean
}

export const FinancialReportTable = ({ rows, loading }: Props) => {
  const data = useMemo<FinancialRow[]>(() => {
    const map = new Map<string, FinancialRow>();

    rows.forEach((r) => {
      const date = r.created_at.split("T")[0];

      const key = [date, r.platform_name, r.agent_name, r.merchant_name].join(
        "|"
      );

      const curr = map.get(key) || {
        date,
        platform: r.platform_name,
        agent: r.agent_name,
        merchant: r.merchant_name,
        txnCount: 0,
        txnValue: 0,
        agentFee: 0,
        platformFee: 0,
        amount: 0,
      };

      curr.txnCount += 1;
      curr.txnValue += r.transaction_final_amount;
      curr.agentFee += r.agent_fee;
      curr.platformFee += r.platform_fee;
      curr.amount += r.transaction_amount;

      map.set(key, curr);
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.platform !== b.platform)
        return a.platform.localeCompare(b.platform);
      if (a.agent !== b.agent) return a.agent.localeCompare(b.agent);
      return a.merchant.localeCompare(b.merchant);
    });
  }, [rows]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, r) => {
        acc.txnCount += r.txnCount;
        acc.txnValue += r.txnValue;
        acc.agentFee += r.agentFee;
        acc.platformFee += r.platformFee;
        acc.amount += r.amount;
        return acc;
      },
      {
        txnCount: 0,
        txnValue: 0,
        agentFee: 0,
        platformFee: 0,
        amount: 0,
      }
    );
  }, [data]);

  /* =============================
   * EXPORTS
   * ============================= */

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    XLSX.writeFile(wb, "financial-report.csv");
  };

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financial Report");
    XLSX.writeFile(wb, "financial-report.xlsx");
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Financial Report</h3>
          <p className="text-xs text-slate-500">
            Detailed transaction and fee data for reconciliation
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="flex-1 md:flex-none"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Export CSV</span>
            <span className="md:hidden">CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportXLSX}
            className="flex-1 md:flex-none"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Export XLSX</span>
            <span className="md:hidden">XLSX</span>
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <div className="max-h-[420px] overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 z-10">
            <tr className="text-left border-b">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Agent</th>
              <th className="px-3 py-2">Merchant</th>
              <th className="px-3 py-2 text-right">Txn Count</th>
              <th className="px-3 py-2 text-right">
                Txn Value (Rp)
              </th>
              <th className="px-3 py-2 text-right text-blue-600">
                Agent Fee
              </th>
              <th className="px-3 py-2 text-right text-purple-600">
                Platform Fee
              </th>
              <th className="px-3 py-2 text-right">
                Total Amount (Rp)
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                    Loading financial data…
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              data.map(r => (
                <tr
                  key={`${r.date}-${r.platform}-${r.agent}-${r.merchant}`}
                  className="border-b last:border-none"
                >
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.platform}</td>
                  <td className="px-3 py-2">{r.agent}</td>
                  <td className="px-3 py-2">{r.merchant}</td>
                  <td className="px-3 py-2 text-right font-medium">
                    {r.txnCount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {r.txnValue.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-blue-600">
                    {r.agentFee.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right text-purple-600">
                    {r.platformFee.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">
                    {r.amount.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {/* TOTAL */}
          <tfoot className="bg-slate-100 font-semibold">
            <tr>
              <td className="px-3 py-2" colSpan={4}>
                TOTAL
              </td>
              <td className="px-3 py-2 text-right">
                {totals.txnCount.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right">
                {totals.txnValue.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right text-blue-600">
                {totals.agentFee.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right text-purple-600">
                {totals.platformFee.toLocaleString()}
              </td>
              <td className="px-3 py-2 text-right">
                {totals.amount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Scroll hint - Mobile only */}
      <p className="text-xs text-slate-500 text-center md:hidden">
        ← Swipe to view all columns →
      </p>
    </Card>
  );
};
