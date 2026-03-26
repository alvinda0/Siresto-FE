"use client";

import { useEffect, useMemo, useState } from "react";
import { transactionService } from "@/services/transaction.service";
import { GroupedTransactionRow } from "@/components/analytics/types";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { SummaryCard } from "@/components/analytics/SummaryCard";
import { PartnerEarningsTrendChart } from "./PartnerEarningsTrendChart";
import { DailyFeeSummaryTable } from "./DailyFeeSummaryTable";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export const PartnerAnalytics = () => {
  const now = new Date();
  const QRIS_FEE_RATE = 0.007; // 0.7% example – adjust as needed
  const DEFAULT_AGENT_COMMISSION_RATE = 0;
  const getPartnerShare = () => {
    if (typeof window === "undefined") return 0.75;

    const url = window.location.href.toLowerCase();

    if (url.includes("pijji")) return 0.75;
    if (url.includes("paymentgate")) return 0.85;
    if (url.includes("payla")) return 0.75;

    return 0.75;
  };

  const partnerShare = getPartnerShare();

  /* =============================
   * DATE (same as GroupAnalytics)
   * ============================= */
  const [start, setStart] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}T00:00`,
  );

  const [end, setEnd] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}T23:59`,
  );

  /* =============================
   * DATA (same pattern)
   * ============================= */
  const [rows, setRows] = useState<GroupedTransactionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRows([]);
    setLoading(true);

    transactionService
      .GetGroupTransactionSummary({
        StartDate: start,
        EndDate: end,
      })
      .then((res) => {
        if (!cancelled) setRows(res.rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [start, end]);

  /* =============================
   * FILTER (partner-safe)
   * ============================= */
  const filteredRows = useMemo(() => {
    return rows.filter((r) => r.status.toLowerCase() === "paid");
  }, [rows]);

  /* =============================
   * KPI CALC (simple)
   * ============================= */
  const totalAmount = useMemo(
    () => filteredRows.reduce((s, r) => s + r.transaction_amount, 0),
    [filteredRows],
  );
  const grossFee = useMemo(
    () => filteredRows.reduce((s, r) => s + r.agent_fee + r.platform_fee, 0),
    [filteredRows],
  );
  const qrisFee = useMemo(
    () =>
      filteredRows.reduce(
        (s, r) => s + r.transaction_amount * QRIS_FEE_RATE,
        0,
      ),
    [filteredRows],
  );

  const agentCommissionFee = useMemo(
    () =>
      filteredRows.reduce((s, r) => {
        const rate =
          (r.agent_commission_fee && r.agent_commission_fee > 0
            ? r.agent_commission_fee
            : DEFAULT_AGENT_COMMISSION_RATE) / 100;

        return s + rate * r.transaction_amount;
      }, 0),
    [filteredRows],
  );

  const platformFee = useMemo(
    () => filteredRows.reduce((s, r) => s + r.platform_fee, 0),
    [filteredRows],
  );

  const cleanFee = useMemo(
    () => Math.max(grossFee - qrisFee - agentCommissionFee - platformFee, 0),
    [grossFee, qrisFee, agentCommissionFee, platformFee],
  );

  const partnerEarning = useMemo(
    () => cleanFee * partnerShare,
    [cleanFee, partnerShare],
  );

  /* =============================
   * RENDER
   * ============================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <Card className="bg-linear-to-r from-purple-600 to-violet-600 text-white rounded-xl">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">Partner Overview</h1>
            <p className="text-sm sm:text-lg text-white/80">
              Partner Fee & Revenue Share
            </p>
            <p className="text-xs sm:text-sm text-white/70 mt-1">
              Partners receive <b>{partnerShare * 100}%</b> of all applicable
              transaction fees.
            </p>

            <p className="text-xs text-white/60 mt-2 inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Showing <b>Paid</b> transactions only
            </p>
          </div>

          <div className="h-11 sm:h-12 px-5 flex items-center justify-center bg-white text-purple-600 rounded-lg text-sm font-semibold self-start sm:self-auto">
            {partnerShare * 100}% Share
          </div>
        </div>
      </Card>

      {/* DATE RANGE (same component) */}
      <Card className="p-4">
        <DateRangeFilter
          start={start}
          end={end}
          onStartChange={setStart}
          onEndChange={setEnd}
        />
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            <Card className="p-4">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
            <Card className="p-4">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
            <Card className="p-4">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
            <Card className="p-4">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-8 w-full" />
            </Card>
          </>
        ) : (
          <>
            <SummaryCard
              title="Total Transaction Amount"
              amount={formatCurrency(totalAmount)}
            />
            <SummaryCard
              title="Total Transactions"
              amount={filteredRows.length}
            />
            <SummaryCard
              title="Total Clean Fees"
              amount={formatCurrency(cleanFee)}
              tone="warning"
            />
            <SummaryCard
              title={`Partner Earnings (${partnerShare * 100}%)`}
              amount={formatCurrency(partnerEarning)}
              tone="success"
            />
          </>
        )}
      </div>

      {/* PARTNER EARNINGS TREND */}
      <Card className="p-4 sm:p-5">
        <h2 className="font-semibold text-sm sm:text-base">
          Partner Earnings Trend
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
          Daily partner earnings over the selected period
        </p>

        <div className="w-full overflow-hidden">
          {loading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <PartnerEarningsTrendChart
              rows={filteredRows}
              partnerShare={partnerShare}
              qrisFeeRate={QRIS_FEE_RATE}
              agentCommissionRate={DEFAULT_AGENT_COMMISSION_RATE}
            />
          )}
        </div>
      </Card>

      {/* DAILY SUMMARY */}
      <Card className="p-4 sm:p-5">
        <h2 className="font-semibold text-sm sm:text-base">
          Daily Fee Summary
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-3 sm:mb-4">
          Detailed breakdown by date
        </p>

        <div className="-mx-4 sm:mx-0 overflow-x-auto">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <DailyFeeSummaryTable
              rows={filteredRows}
              partnerShare={partnerShare}
              qrisFeeRate={QRIS_FEE_RATE}
              agentComissionRate={DEFAULT_AGENT_COMMISSION_RATE}
            />
          )}
        </div>
      </Card>
    </div>
  );
};
