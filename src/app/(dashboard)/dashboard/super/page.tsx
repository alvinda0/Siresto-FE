"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { transactionService } from "@/services/transaction.service";
import { platformService } from "@/services/platform.service";
import { agentService } from "@/services/agent.service";
import { partnerService } from "@/services/partner.service";
import { merchantService } from "@/services/merchant.service";
import { vendorService } from "@/services/vendor.service";
import { AnalyticsData, AnalyticsQueryParams } from "@/types/transaction";
import { Partner } from "@/types/partner";
import { Platform } from "@/types/platform";
import { Agent } from "@/types/agent";
import { Merchant } from "@/types/merchant";
import { Vendor } from "@/types/vendor";
import { SelectInput } from "@/components/SelectInput";


// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

const DashboardSuperPage = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsQueryParams>({});

  // Dropdown options
  const [partners, setPartners] = useState<Partner[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [
          partnersData,
          platformsData,
          agentsData,
          merchantsData,
          vendorsData,
        ] = await Promise.all([
          partnerService.getPartners(),
          platformService.getPlatformsForSelect(),
          agentService.getAgentsForSelect(),
          merchantService.getMerchants({ limit: 100 }),
          vendorService.getVendors({ limit: 100 }),
        ]);

        setPartners(partnersData);
        setPlatforms(platformsData);
        setAgents(agentsData);
        setMerchants(merchantsData.data || []);
        setVendors(vendorsData.data || []);
      } catch (error: any) {
        console.error("Failed to fetch dropdown data:", error);
        toast.error("Failed to load filter options");
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await transactionService.getAnalytics(filters);
        setAnalyticsData(response.data);
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch analytics data");
        console.error("Analytics fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filters]);

  // Tambahkan useMemo untuk filtered options
  const filteredAgents = useMemo(() => {
    if (!filters.platform_id || filters.platform_id === "all") {
      return agents; // Jika tidak ada platform dipilih, tampilkan semua
    }
    // Filter agent berdasarkan platform_id
    return agents.filter((agent) => agent.platform_id === filters.platform_id);
  }, [agents, filters.platform_id]);

  const filteredMerchantsOptions = useMemo(() => {
    if (!filters.agent_id || filters.agent_id === "all") {
      // Jika tidak ada agent dipilih, tapi ada platform dipilih
      if (filters.platform_id && filters.platform_id !== "all") {
        return merchants.filter(
          (merchant) => merchant.platform_id === filters.platform_id,
        );
      }
      return merchants; // Jika tidak ada filter, tampilkan semua
    }
    // Filter merchant berdasarkan agent_id
    return merchants.filter(
      (merchant) => merchant.agent_id === filters.agent_id,
    );
  }, [merchants, filters.agent_id, filters.platform_id]);

  // Tambahkan handler untuk reset filters cascade
  const handlePlatformChange = (value: string) => {
    handleFilterChange("platform_id", value);
    // Reset agent dan merchant jika platform berubah
    if (filters.agent_id && filters.agent_id !== "all") {
      handleFilterChange("agent_id", "all");
    }
    if (filters.merchant_id && filters.merchant_id !== "all") {
      handleFilterChange("merchant_id", "all");
    }
  };

  const handleAgentChange = (value: string) => {
    handleFilterChange("agent_id", value);
    // Reset merchant jika agent berubah
    if (filters.merchant_id && filters.merchant_id !== "all") {
      handleFilterChange("merchant_id", "all");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Prepare chart data for amounts only
  const chartData = {
    labels:
      analyticsData?.daily.map((day) =>
        new Date(day.date).toLocaleDateString("id-ID", {
          month: "short",
          day: "numeric",
        }),
      ) || [],
    datasets: [
      {
        label: "Paid",
        data:
          analyticsData?.daily.map(
            (day) =>
              day.statuses.find((s) => s.status === "paid")?.final_amount || 0,
          ) || [],
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
      {
        label: "Pending",
        data:
          analyticsData?.daily.map(
            (day) =>
              day.statuses.find((s) => s.status === "pending")?.final_amount ||
              0,
          ) || [],
        backgroundColor: "rgba(234, 179, 8, 0.8)",
        borderColor: "rgba(234, 179, 8, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#1e293b",
          font: {
            size: 12,
            weight: 500,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        padding: 12,
        titleFont: {
          size: 14,
          weight: 600,
        },
        bodyFont: {
          size: 13,
        },
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#475569",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.15)",
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: "#475569",
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.15)",
          drawBorder: false,
        },
      },
    },
  };

  const handleFilterChange = (
    key: keyof AnalyticsQueryParams,
    value: string,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-xl border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-900">Filters</CardTitle>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Status</Label>
              <SelectInput
                data={[
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "paid", label: "Paid" },
                  { value: "cancel", label: "Cancel" },
                  { value: "refund", label: "Refund" },
                  { value: "expire", label: "Expire" },
                ]}
                value={filters.status || "all"}
                onChange={(value) => handleFilterChange("status", value)}
                valueKey="value"
                labelKey="label"
                placeholder="All Status"
                searchPlaceholder="Search status..."
                emptyText="No status found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Vendor Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Vendor</Label>
              <SelectInput
                data={[{ vendor_id: "all", name: "All Vendors" }, ...vendors]}
                value={filters.vendor_id || "all"}
                onChange={(value) => handleFilterChange("vendor_id", value)}
                valueKey="vendor_id"
                labelKey="name"
                placeholder="All Vendors"
                searchPlaceholder="Search vendor..."
                emptyText="No vendor found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Partner Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Partner</Label>
              <SelectInput
                data={[
                  { partner_id: "all", name: "All Partners" },
                  ...partners,
                ]}
                value={filters.partner_id || "all"}
                onChange={(value) => handleFilterChange("partner_id", value)}
                valueKey="partner_id"
                labelKey="name"
                placeholder="All Partners"
                searchPlaceholder="Search partner..."
                emptyText="No partner found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Platform</Label>
              <SelectInput
                data={[
                  { platform_id: "all", name: "All Platforms" },
                  ...platforms,
                ]}
                value={filters.platform_id || "all"}
                onChange={handlePlatformChange}
                valueKey="platform_id"
                labelKey="name"
                placeholder="All Platforms"
                searchPlaceholder="Search platform..."
                emptyText="No platform found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Agent Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Agent</Label>
              <SelectInput
                data={[
                  { agent_id: "all", name: "All Agents" },
                  ...filteredAgents,
                ]}
                value={filters.agent_id || "all"}
                onChange={handleAgentChange}
                valueKey="agent_id"
                labelKey="name"
                placeholder="All Agents"
                searchPlaceholder="Search agent..."
                emptyText="No agent found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>

            {/* Merchant Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Merchant</Label>
              <SelectInput
                data={[
                  { merchant_id: "all", name: "All Merchants" },
                  ...filteredMerchantsOptions,
                ]}
                value={filters.merchant_id || "all"}
                onChange={(value) => handleFilterChange("merchant_id", value)}
                valueKey="merchant_id"
                labelKey="name"
                placeholder="All Merchants"
                searchPlaceholder="Search merchant..."
                emptyText="No merchant found."
                className="bg-white border-slate-300 text-slate-900"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-linear-to-br from-blue-50 to-blue-100/50 backdrop-blur-xl border border-blue-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <h3 className="text-sm font-semibold text-blue-700">Total</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-900">
              {formatNumber(analyticsData?.total.count || 0)}
            </div>
            <div className="text-xs font-medium text-blue-700">
              Before Fee: {formatCurrency(analyticsData?.total.amount || 0)}
            </div>
            <div className="text-xs font-medium text-blue-700">
              After Fee:{" "}
              {formatCurrency(analyticsData?.total.final_amount || 0)}
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="bg-linear-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-xl border border-emerald-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <h3 className="text-sm font-semibold text-emerald-700">Paid</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-emerald-900">
              {formatNumber(
                analyticsData?.summary.find((s) => s.status === "paid")
                  ?.count || 0,
              )}
            </div>
            <div className="text-xs font-medium text-emerald-700">
              Before Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "paid")
                  ?.amount || 0,
              )}
            </div>
            <div className="text-xs font-medium text-emerald-700">
              After Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "paid")
                  ?.final_amount || 0,
              )}
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-linear-to-br from-amber-50 to-amber-100/50 backdrop-blur-xl border border-amber-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <h3 className="text-sm font-semibold text-amber-700">Pending</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-amber-900">
              {formatNumber(
                analyticsData?.summary.find((s) => s.status === "pending")
                  ?.count || 0,
              )}
            </div>
            <div className="text-xs font-medium text-amber-700">
              Before Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "pending")
                  ?.amount || 0,
              )}
            </div>
            <div className="text-xs font-medium text-amber-700">
              After Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "pending")
                  ?.final_amount || 0,
              )}
            </div>
          </div>
        </div>

        {/* Cancel */}
        <div className="bg-linear-to-br from-red-50 to-red-100/50 backdrop-blur-xl border border-red-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <h3 className="text-sm font-semibold text-red-700">Cancel</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-900">
              {formatNumber(
                analyticsData?.summary.find((s) => s.status === "cancel")
                  ?.count || 0,
              )}
            </div>
            <div className="text-xs font-medium text-red-700">
              Before Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "cancel")
                  ?.amount || 0,
              )}
            </div>
            <div className="text-xs font-medium text-red-700">
              After Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "cancel")
                  ?.final_amount || 0,
              )}
            </div>
          </div>
        </div>

        {/* Refund */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100/50 backdrop-blur-xl border border-purple-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <h3 className="text-sm font-semibold text-purple-700">Refund</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-900">
              {formatNumber(
                analyticsData?.summary.find((s) => s.status === "refund")
                  ?.count || 0,
              )}
            </div>
            <div className="text-xs font-medium text-purple-700">
              Before Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "refund")
                  ?.amount || 0,
              )}
            </div>
            <div className="text-xs font-medium text-purple-700">
              After Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "refund")
                  ?.final_amount || 0,
              )}
            </div>
          </div>
        </div>

        {/* Expire */}
        <div className="bg-linear-to-br from-slate-50 to-slate-100/50 backdrop-blur-xl border border-slate-200 rounded-lg shadow-md hover:shadow-lg transition-all p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <h3 className="text-sm font-semibold text-slate-700">Expire</h3>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-slate-900">
              {formatNumber(
                analyticsData?.summary.find((s) => s.status === "expire")
                  ?.count || 0,
              )}
            </div>
            <div className="text-xs font-medium text-slate-700">
              Before Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "expire")
                  ?.amount || 0,
              )}
            </div>
            <div className="text-xs font-medium text-slate-700">
              After Fee:{" "}
              {formatCurrency(
                analyticsData?.summary.find((s) => s.status === "expire")
                  ?.final_amount || 0,
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart - Amount Only */}
      <Card className="bg-white/80 backdrop-blur-xl border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 font-bold">
            Transaction Chart Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[450px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSuperPage;
