"use client";

import { useEffect, useMemo, useState } from "react";
import { transactionService } from "@/services/transaction.service";
import { GroupedTransactionRow } from "./types";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { DateRangeFilter } from "./DateRangeFilter";
import { SummaryCard } from "./SummaryCard";
import { TransactionRevenueChart } from "./TransactionRevenueChart";
import { GrowthVelocityChart } from "./GrowthVelocityChart";
import { HourlyTransactionPatternChart } from "./HourlyTransactionPatternChart";
import { PlatformContributionChart } from "./PlatformContributionChart";
import { PlatformContributionAmountChart } from "./PlatformContributionAmountChart";
import { HourlyTransactionHeatmap } from "./HourlyTransactionHeatmap";
import { InsightCards } from "./InsightCards";
import { TopPerformanceList } from "./TopPerformanceList";
import { FinancialReportTable } from "./FinancialReportTable";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { SelectInput } from "@/components/SelectInput";

/* =============================
 * TYPES
 * ============================= */

type ClientFilters = {
  platformId: string;
  partnerId: string;
  agentId: string;
  merchantId: string;
  vendorId: string;
  status: string;
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

/* =============================
 * LOADING SKELETON COMPONENTS
 * ============================= */

const SkeletonCard = () => (
  <Card className="relative overflow-hidden">
    <div className="p-5 space-y-3">
      <div className="h-3 w-24 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]" />
      <div className="h-8 w-32 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]" />
    </div>
  </Card>
);

const SkeletonChart = ({ height = "360px" }: { height?: string }) => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="h-4 w-40 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded animate-shimmer bg-[length:200%_100%]" />
      <div
        style={{ height }}
        className="bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 rounded-lg animate-shimmer bg-[length:200%_100%]"
      />
    </div>
  </Card>
);

/* =============================
 * MAIN COMPONENT
 * ============================= */

export const GroupAnalytics = () => {
  const now = new Date();
  const [showFilters, setShowFilters] = useState(false);

  /* =============================
   * DATE (SERVER SIDE)
   * ============================= */

  const [start, setStart] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}T00:00`,
  );

  const [end, setEnd] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(now.getDate()).padStart(2, "0")}T23:59`,
  );

  /* =============================
   * LOADING STATES
   * ============================= */

  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  /* =============================
   * DATA
   * ============================= */

  const [rows, setRows] = useState<GroupedTransactionRow[]>([]);

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
        if (!cancelled) {
          setRows(res.rows);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [start, end]);

  /* =============================
   * CLIENT FILTERS
   * ============================= */

  const [filters, setFilters] = useState<ClientFilters>({
    platformId: "ALL",
    partnerId: "ALL",
    agentId: "ALL",
    merchantId: "ALL",
    vendorId: "ALL",
    status: "ALL",
  });

  /* Reset filters when date changes */
  useEffect(() => {
    setFilters({
      platformId: "ALL",
      partnerId: "ALL",
      agentId: "ALL",
      merchantId: "ALL",
      vendorId: "ALL",
      status: "ALL",
    });
  }, [start, end]);

  /* =============================
   * FILTERING LOADING STATE
   * ============================= */
  useEffect(() => {
    if (rows.length === 0 || loading) return;

    setIsFiltering(true);

    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters, rows.length, loading]);

  /* =============================
   * FILTER OPTIONS (FROM ROWS)
   * ============================= */

  const filterOptions = useMemo(() => {
    const platforms = new Map<string, string>();
    const partners = new Map<string, string>();
    const agents = new Map<string, string>();
    const merchants = new Map<string, string>();
    const vendors = new Map<string, string>();
    const statuses = new Set<string>();

    rows.forEach((r) => {
      platforms.set(r.platform_id, r.platform_name);
      partners.set(r.partner_id, r.partner_name);
      if (r.vendor_id && r.vendor_name) {
        vendors.set(r.vendor_id, r.vendor_name);
      }
      statuses.add(r.status);
    });

    // Filter agents berdasarkan platform yang dipilih
    const availableAgents = rows.filter((r) => {
      if (
        filters.platformId !== "ALL" &&
        r.platform_id !== filters.platformId
      ) {
        return false;
      }
      return true;
    });

    availableAgents.forEach((r) => {
      agents.set(r.agent_id, r.agent_name);
    });

    // Filter merchants berdasarkan agent ATAU platform yang dipilih
    const availableMerchants = rows.filter((r) => {
      // Jika ada agent dipilih, filter berdasarkan agent
      if (filters.agentId !== "ALL" && r.agent_id !== filters.agentId) {
        return false;
      }
      // Jika tidak ada agent tapi ada platform, filter berdasarkan platform
      if (
        filters.agentId === "ALL" &&
        filters.platformId !== "ALL" &&
        r.platform_id !== filters.platformId
      ) {
        return false;
      }
      return true;
    });

    availableMerchants.forEach((r) => {
      merchants.set(r.merchant_id, r.merchant_name);
    });

    return {
      platforms: Array.from(platforms, ([id, name]) => ({ id, name })),
      partners: Array.from(partners, ([id, name]) => ({ id, name })),
      agents: Array.from(agents, ([id, name]) => ({ id, name })),
      merchants: Array.from(merchants, ([id, name]) => ({ id, name })),
      vendors: Array.from(vendors, ([id, name]) => ({ id, name })),
      statuses: Array.from(statuses),
    };
  }, [rows, filters.platformId, filters.agentId]);

  /* =============================
   * CASCADING HANDLERS
   * ============================= */

  const handlePlatformChange = (value: string) => {
    setFilters((f) => ({
      ...f,
      platformId: value,
      // Reset agent dan merchant jika platform berubah
      agentId: "ALL",
      merchantId: "ALL",
    }));
  };

  const handleAgentChange = (value: string) => {
    setFilters((f) => ({
      ...f,
      agentId: value,
      // Reset merchant jika agent berubah
      merchantId: "ALL",
    }));
  };

  /* =============================
   * APPLY CLIENT FILTERS
   * ============================= */

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filters.platformId !== "ALL" && r.platform_id !== filters.platformId)
        return false;
      if (filters.partnerId !== "ALL" && r.partner_id !== filters.partnerId)
        return false;
      if (filters.agentId !== "ALL" && r.agent_id !== filters.agentId)
        return false;
      if (filters.merchantId !== "ALL" && r.merchant_id !== filters.merchantId)
        return false;
      if (
        filters.vendorId !== "ALL" &&
        r.vendor_id &&
        r.vendor_id !== filters.vendorId
      )
        return false;
      if (filters.status !== "ALL" && r.status !== filters.status) return false;
      return true;
    });
  }, [rows, filters]);

  /* =============================
   * KPI CALCULATIONS
   * ============================= */

  const totalAmount = useMemo(
    () => filteredRows.reduce((sum, r) => sum + r.transaction_final_amount, 0),
    [filteredRows],
  );

  const totalAmountBeforeFee = useMemo(
    () => filteredRows.reduce((sum, r) => sum + r.transaction_amount, 0),
    [filteredRows],
  );

  const totalFees = useMemo(
    () =>
      filteredRows.reduce((sum, r) => sum + r.agent_fee + r.platform_fee, 0),
    [filteredRows],
  );

  const uniqueDays =
    new Set(filteredRows.map((r) => r.created_at.split("T")[0])).size || 1;

  const avgDailyVolume = Math.round(filteredRows.length / uniqueDays);
  const avgTicket = totalAmountBeforeFee / (filteredRows.length || 1);
  const feeTakeRate = totalAmountBeforeFee
    ? (totalFees / totalAmountBeforeFee) * 100
    : 0;

  const successRate = useMemo(() => {
    if (!filteredRows.length) return "0";

    const paidCount = filteredRows.filter(
      (r) => r.status.toLowerCase() === "paid",
    ).length;

    return ((paidCount / filteredRows.length) * 100).toFixed(2);
  }, [filteredRows]);

  const { peakHourTx, peakHourTxHour } = useMemo(() => {
    const hourMap = new Map<number, number>();

    filteredRows.forEach((r) => {
      const hour = new Date(r.created_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });

    let maxCount = 0;
    let maxHour = 0;

    hourMap.forEach((count, hour) => {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    });

    return {
      peakHourTx: maxCount,
      peakHourTxHour: maxHour,
    };
  }, [filteredRows]);

  const peakHour = peakHourTxHour;
  const peakVolume = peakHourTx;

  const platformStats = useMemo(() => {
    const map = new Map<string, any>();

    filteredRows.forEach((r) => {
      const curr = map.get(r.platform_name) || {
        name: r.platform_name,
        volume: 0,
        amount: 0,
      };

      curr.volume += 1;
      curr.amount += r.transaction_final_amount;

      map.set(r.platform_name, curr);
    });

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredRows]);

  const agentStats = useMemo(() => {
    const map = new Map<string, any>();

    filteredRows.forEach((r) => {
      const curr = map.get(r.agent_name) || {
        name: r.agent_name,
        volume: 0,
        amount: 0,
      };

      curr.volume += 1;
      curr.amount += r.transaction_final_amount;
      map.set(r.agent_name, curr);
    });

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredRows]);

  const merchantStats = useMemo(() => {
    const map = new Map<string, any>();

    filteredRows.forEach((r) => {
      const curr = map.get(r.merchant_name) || {
        name: r.merchant_name,
        volume: 0,
        amount: 0,
      };

      curr.volume += 1;
      curr.amount += r.transaction_final_amount;
      map.set(r.merchant_name, curr);
    });

    return Array.from(map.values())
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [filteredRows]);

  const topPlatformShare = useMemo(() => {
    if (!filteredRows.length) return 0;

    const platformCount = new Map<string, number>();

    filteredRows.forEach((r) => {
      platformCount.set(
        r.platform_id,
        (platformCount.get(r.platform_id) || 0) + 1,
      );
    });

    const top3Volume = Array.from(platformCount.values())
      .sort((a, b) => b - a)
      .slice(0, 3)
      .reduce((sum, v) => sum + v, 0);

    return Number(((top3Volume / filteredRows.length) * 100).toFixed(2));
  }, [filteredRows]);

  /* =============================
   * COMBINED LOADING STATE
   * ============================= */
  const isLoading = loading || isFiltering;

  /* =============================
   * RENDER
   * ============================= */

  return (
    <div className="relative space-y-6">
      {/* FLOATING LOADING INDICATOR */}
      {isFiltering && !loading && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Applying filters...
            </span>
          </div>
        </div>
      )}

      <Card className="space-y-6">
        {/* HEADER */}
        <CardHeader className="space-y-3 w-full flex flex-col justify-center mb-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Analytics Dashboard</h2>

            {/* Mini loading indicator */}
            {isFiltering && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                <span className="text-xs font-medium text-blue-600">
                  Filtering
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center justify-between w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mb-0"
          >
            <span className="text-sm font-medium text-slate-700">
              Advanced Filters
            </span>
            {showFilters ? (
              <ChevronUp className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            )}
          </button>
          <div
            className={`
              flex flex-col gap-3 w-full
              ${showFilters ? "flex" : "hidden md:flex"}
            `}
          >
            {/* Date Range Filter */}
            <DateRangeFilter
              start={start}
              end={end}
              onStartChange={setStart}
              onEndChange={setEnd}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-sm font-medium">Filters:</span>

            {/* Partner Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Partners" },
                ...filterOptions.partners,
              ]}
              value={filters.partnerId}
              onChange={(v) => setFilters((f) => ({ ...f, partnerId: v }))}
              valueKey="id"
              labelKey="name"
              placeholder="All Partners"
              searchPlaceholder="Search partner..."
              emptyText="No partner found."
              disabled={loading}
              className="w-full sm:w-[180px]"
            />

            {/* Vendor Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Vendors" },
                ...filterOptions.vendors,
              ]}
              value={filters.vendorId}
              onChange={(v) => setFilters((f) => ({ ...f, vendorId: v }))}
              valueKey="id"
              labelKey="name"
              placeholder="All Vendors"
              searchPlaceholder="Search vendor..."
              emptyText="No vendor found."
              disabled={loading}
              className="w-full sm:w-[180px]"
            />

            {/* Platform Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Platforms" },
                ...filterOptions.platforms,
              ]}
              value={filters.platformId}
              onChange={handlePlatformChange}
              valueKey="id"
              labelKey="name"
              placeholder="All Platforms"
              searchPlaceholder="Search platform..."
              emptyText="No platform found."
              disabled={loading}
              className="w-full sm:w-[180px]"
            />

            {/* Agent Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Agents" },
                ...filterOptions.agents,
              ]}
              value={filters.agentId}
              onChange={handleAgentChange}
              valueKey="id"
              labelKey="name"
              placeholder="All Agents"
              searchPlaceholder="Search agent..."
              emptyText="No agent found."
              disabled={loading}
              className="w-full sm:w-[180px]"
            />

            {/* Merchant Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Merchants" },
                ...filterOptions.merchants,
              ]}
              value={filters.merchantId}
              onChange={(v) => setFilters((f) => ({ ...f, merchantId: v }))}
              valueKey="id"
              labelKey="name"
              placeholder="All Merchants"
              searchPlaceholder="Search merchant..."
              emptyText="No merchant found."
              disabled={loading}
              className="w-full sm:w-[200px]"
            />

            {/* Status Filter */}
            <SelectInput
              data={[
                { id: "ALL", name: "All Status" },
                ...filterOptions.statuses.map((s) => ({ id: s, name: s })),
              ]}
              value={filters.status}
              onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
              valueKey="id"
              labelKey="name"
              placeholder="All Status"
              searchPlaceholder="Search status..."
              emptyText="No status found."
              disabled={loading}
              className="w-full sm:w-[160px]"
            />
          </div>
        </CardHeader>

        {/* FULL PAGE LOADING (Initial Load) */}
        {loading && (
          <div className="space-y-6 px-6 pb-6">
            {/* Skeleton KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Skeleton Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkeletonChart />
              </div>
              <SkeletonChart />
            </div>

            <SkeletonChart />
          </div>
        )}

        {/* CONTENT */}
        {!loading && (
          <div
            className={`
              transition-all duration-300 ease-in-out
              ${isFiltering ? "opacity-60 pointer-events-none" : "opacity-100"}
            `}
          >
            {/* KPI SECTION */}
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <SummaryCard
                title="TOTAL TRANSACTION (RP)"
                amount={formatCurrency(totalAmount)}
              />

              <SummaryCard
                title="TOTAL TRANSACTION BEFORE FEE"
                amount={formatCurrency(totalAmountBeforeFee)}
              />

              <SummaryCard
                title="TOTAL FEES"
                amount={formatCurrency(totalFees)}
                tone="warning"
              />

              <SummaryCard title="AVG DAILY VOLUME" amount={avgDailyVolume} />

              <SummaryCard
                title="AVG TRANSACTION VALUE"
                amount={formatCurrency(avgTicket)}
              />

              <SummaryCard
                title="FEE TAKE RATE %"
                amount={feeTakeRate.toFixed(2)}
                tone="warning"
              />

              <SummaryCard
                title="SUCCESS RATE %"
                amount={successRate}
                tone={"success"}
              />

              <SummaryCard
                title="PEAK HOUR TX"
                amount={peakHourTx}
                tone="danger"
              />
            </CardContent>

            {/* CHARTS */}
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionRevenueChart rows={filteredRows} />
              </div>

              <div>
                <GrowthVelocityChart rows={filteredRows} />
              </div>
            </CardContent>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Hourly Transaction Patterns
                </h3>
                <p className="text-xs text-slate-500">
                  Average transactions and success rate by hour of day
                </p>
              </div>

              <HourlyTransactionPatternChart rows={filteredRows} />
            </CardContent>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Platform Contribution Over Time — Transaction Volume
                </h3>
                <p className="text-xs text-slate-500">
                  Stacked view of platform transaction volume
                </p>
              </div>

              <PlatformContributionChart rows={filteredRows} />
            </CardContent>

            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Platform Contribution Over Time — Transaction Amount
                </h3>
                <p className="text-xs text-slate-500">
                  Stacked view of platform transaction value (Rp)
                </p>
              </div>

              <PlatformContributionAmountChart rows={filteredRows} />
            </CardContent>

            <CardContent>
              <HourlyTransactionHeatmap rows={filteredRows} />
            </CardContent>

            <CardContent>
              <InsightCards
                peakHour={peakHour}
                peakVolume={peakHourTx}
                topPlatformShare={topPlatformShare}
                growthLeader={merchantStats[0]?.name}
              />
            </CardContent>

            <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
              <TopPerformanceList
                title="Top Performing Platform"
                subtitle="By transaction value"
                items={platformStats}
                color="bg-blue-500"
              />

              <TopPerformanceList
                title="Top Performing Agent"
                subtitle="By transaction value"
                items={agentStats}
                color="bg-emerald-500"
              />

              <TopPerformanceList
                title="Top Performing Merchants"
                subtitle="By transaction value"
                items={merchantStats}
                color="bg-purple-500"
              />
            </CardContent>

            <CardContent className="overflow-x-auto">
              <div className="min-w-[900px]">
                <FinancialReportTable
                  rows={filteredRows}
                  loading={isFiltering}
                />
              </div>
            </CardContent>
          </div>
        )}
      </Card>

      {/* Add shimmer keyframe to tailwind config if not exists */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};
