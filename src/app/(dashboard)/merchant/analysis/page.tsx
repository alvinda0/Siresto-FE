"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import MerchantInformation from "@/components/merchant/analysis/MerchantInformation";
import AgentInformation from "@/components/merchant/analysis/AgentInformation";
import StatisticCard from "@/components/merchant/analysis/StatisticCard";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { merchantService } from "@/services/merchant.service";
import { transactionService } from "@/services/transaction.service";
import { vendorService } from "@/services/vendor.service";
import { MerchantAnalytics } from "@/types/merchant";
import { Vendor } from "@/types/vendor";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  Users,
  Store,
  Percent,
  Activity,
  AlertTriangle,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import AgentPortfolioChart from "@/components/merchant/analysis/AgentPortfolioChart";
import MerchantHealthChart from "@/components/merchant/analysis/MerchantHealthChart";
import { SelectInput } from "@/components/SelectInput";

// ============================================================================
// TYPES
// ============================================================================

// Types untuk Merchant Information
export interface MerchantData {
  merchantName: string;
  merchantId: string;
  assignedAgent: string;
  dailyVolume: number;
  utilization: number;
  status: "HEALTHY" | "NEED ATTENTION" | "OVER CAPACITY";
}

// Types untuk Agent Information
export interface AgentData {
  agentName: string;
  agentId: string;
  totalAssigned: number;
  healthy: number;
  lowUtil: number;
  overCapacity: number;
  inactive: number;
  avgUtilization: number;
  status: "EFFECTIVE" | "NEEDS ATTENTION" | "OVER CAPACITY";
}

// ============================================================================
// COMPONENT
// ============================================================================

const MerchantAnalysisPage = () => {
  // ==================== STATE ====================

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);

  // Merchant Analytics State
  const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Merchant Data State
  const [merchantData, setMerchantData] = useState<MerchantData[]>([]);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(true);
  const [merchantStats, setMerchantStats] = useState({
    avgUtilization: 0,
    lowUtilCount: 0,
    lowUtilPercentage: 0,
  });

  // Agent Data State
  const [agentData, setAgentData] = useState<AgentData[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [agentStats, setAgentStats] = useState({
    totalAgents: 0,
    avgUtilization: 0,
    effectiveAgents: 0,
    needsAttention: 0,
    overCapacity: 0,
  });

  // ==================== UTILITY FUNCTIONS ====================

  const getMaxTransactionLimit = (): number => {
    if (typeof window === "undefined") return 75000000;
    const hostname = window.location.href.toLowerCase();
    if (hostname.includes("pijji")) {
      return 100000000;
    } else if (hostname.includes("payla")) {
      return 75000000;
    }
    return 75000000;
  };

  const getFormattedMaxLimit = (): string => {
    const limit = getMaxTransactionLimit();
    if (limit === 100000000) {
      return "100M";
    } else if (limit === 75000000) {
      return "75M";
    }
    return `${(limit / 1000000).toFixed(0)}M`;
  };

  const calculateUtilization = (dailyVolume: number): number => {
    const maxLimit = getMaxTransactionLimit();
    const utilization = (dailyVolume / maxLimit) * 100;
    return utilization;
  };

  const getStatus = (
    utilization: number,
    dailyVolume: number,
  ): "HEALTHY" | "NEED ATTENTION" | "OVER CAPACITY" => {
    const maxLimit = getMaxTransactionLimit();

    // Check if over capacity first
    if (dailyVolume > maxLimit) {
      return "OVER CAPACITY";
    }

    // Normal status logic
    return utilization > 50 ? "HEALTHY" : "NEED ATTENTION";
  };

  const getStartDateTime = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00`;
  };

  const getEndDateTime = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59`;
  };

  const getDateString = (): string => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ==================== DATA PROCESSING - MERCHANT ====================

  const processMerchantData = (rows: any[]): MerchantData[] => {
    const merchantMap = new Map<
      string,
      {
        merchantName: string;
        merchantId: string;
        agentName: string;
        totalVolume: number;
      }
    >();

    // Filter dan aggregate data merchant
    rows.forEach((row) => {
      // ✅ FILTER: Hanya proses transaksi dengan status 'paid'
      if (row.status !== "paid") return;

      // ✅ FILTER: Filter by vendor_id if selected
      if (selectedVendor !== "all" && row.vendor_id !== selectedVendor) return;

      const existing = merchantMap.get(row.merchant_id);

      if (existing) {
        // Merchant sudah ada, tambahkan volume transaksi
        existing.totalVolume += row.transaction_final_amount;
      } else {
        // Merchant baru, buat entry baru
        merchantMap.set(row.merchant_id, {
          merchantName: row.merchant_name,
          merchantId: row.merchant_id,
          agentName: row.agent_name,
          totalVolume: row.transaction_final_amount,
        });
      }
    });

    // Convert Map ke Array dan hitung utilization & status
    const merchantData: MerchantData[] = Array.from(merchantMap.values()).map(
      (merchant) => {
        const utilization = calculateUtilization(merchant.totalVolume);
        const status = getStatus(utilization, merchant.totalVolume);

        return {
          merchantName: merchant.merchantName,
          merchantId: merchant.merchantId,
          assignedAgent: merchant.agentName,
          dailyVolume: merchant.totalVolume,
          utilization,
          status,
        };
      },
    );

    return merchantData;
  };

  const calculateMerchantStatistics = (data: MerchantData[]) => {
    // Handle empty data
    if (data.length === 0) {
      setMerchantStats({
        avgUtilization: 0,
        lowUtilCount: 0,
        lowUtilPercentage: 0,
      });
      return;
    }

    // Hitung rata-rata utilization
    const avgUtil =
      data.reduce((sum, m) => sum + m.utilization, 0) / data.length;

    // Hitung jumlah merchant dengan utilization rendah (<50%)
    const lowUtilCount = data.filter((m) => m.utilization < 50).length;

    // Hitung persentase merchant dengan utilization rendah
    const lowUtilPercentage = (lowUtilCount / data.length) * 100;

    setMerchantStats({
      avgUtilization: avgUtil,
      lowUtilCount,
      lowUtilPercentage,
    });
  };

  // ==================== DATA PROCESSING - AGENT ====================

  const processAgentData = (rows: any[]): AgentData[] => {
    // Map untuk menyimpan data agent dan merchant-nya
    const agentMap = new Map<
      string,
      {
        agentName: string;
        agentId: string;
        merchants: Map<string, number>; // merchantId -> totalVolume
      }
    >();

    // Filter dan group transaksi berdasarkan agent
    rows.forEach((row) => {
      // ✅ FILTER: Hanya proses transaksi dengan status 'paid'
      if (row.status !== "paid") return;

      // ✅ FILTER: Filter by vendor_id if selected
      if (selectedVendor !== "all" && row.vendor_id !== selectedVendor) return;

      // Cek apakah agent sudah ada di map
      if (!agentMap.has(row.agent_id)) {
        agentMap.set(row.agent_id, {
          agentName: row.agent_name,
          agentId: row.agent_id,
          merchants: new Map(),
        });
      }

      const agent = agentMap.get(row.agent_id)!;

      // Aggregate volume per merchant
      const currentVolume = agent.merchants.get(row.merchant_id) || 0;
      agent.merchants.set(
        row.merchant_id,
        currentVolume + row.transaction_final_amount,
      );
    });

    // Convert Map ke Array dan hitung statistik per agent
    const agentData: AgentData[] = Array.from(agentMap.values()).map(
      (agent) => {
        // Ambil semua volume merchant yang di-handle agent ini
        const merchantVolumes = Array.from(agent.merchants.values());
        const totalAssigned = merchantVolumes.length;

        // Hitung utilization untuk setiap merchant
        const merchantUtils = merchantVolumes.map((volume) =>
          calculateUtilization(volume),
        );

        // ✅ KATEGORIKAN MERCHANT DENGAN OVER CAPACITY
        const maxLimit = getMaxTransactionLimit();
        const overCapacity = merchantVolumes.filter(
          (volume) => volume > maxLimit,
        ).length;

        // Kategorikan merchant berdasarkan utilization (exclude yang over capacity)
        const healthy = merchantUtils.filter(
          (util, idx) => merchantVolumes[idx] <= maxLimit && util > 50,
        ).length;

        const lowUtil = merchantUtils.filter(
          (util, idx) =>
            merchantVolumes[idx] <= maxLimit && util > 0 && util <= 50,
        ).length;

        const inactive = merchantUtils.filter(
          (util, idx) =>
            merchantVolumes[idx] <= maxLimit && (util === 0 || util < 1),
        ).length;

        // Hitung rata-rata utilization agent
        const avgUtilization =
          merchantUtils.length > 0
            ? merchantUtils.reduce((sum, util) => sum + util, 0) /
              merchantUtils.length
            : 0;

        // ✅ TENTUKAN STATUS AGENT DENGAN PRIORITAS OVER CAPACITY
        let status: "EFFECTIVE" | "NEEDS ATTENTION" | "OVER CAPACITY";

        if (overCapacity > 0) {
          // Prioritas pertama: jika ada merchant over capacity
          status = "OVER CAPACITY";
        } else if (avgUtilization > 50) {
          // Jika tidak ada over capacity dan avg util > 50%
          status = "EFFECTIVE";
        } else {
          // Jika avg util <= 50%
          status = "NEEDS ATTENTION";
        }

        return {
          agentName: agent.agentName,
          agentId: agent.agentId,
          totalAssigned,
          healthy,
          lowUtil,
          overCapacity,
          inactive,
          avgUtilization,
          status,
        };
      },
    );

    return agentData;
  };

  const calculateAgentStatistics = (data: AgentData[]) => {
    // Handle empty data
    if (data.length === 0) {
      setAgentStats({
        totalAgents: 0,
        avgUtilization: 0,
        effectiveAgents: 0,
        needsAttention: 0,
        overCapacity: 0, // ✅ TAMBAHAN BARU
      });
      return;
    }

    // Hitung statistik keseluruhan agent
    const totalAgents = data.length;

    // Rata-rata utilization dari semua agent
    const avgUtilization =
      data.reduce((sum, agent) => sum + agent.avgUtilization, 0) / data.length;

    // Jumlah agent yang effective (avg util > 50% dan tidak ada over capacity)
    const effectiveAgents = data.filter(
      (agent) => agent.status === "EFFECTIVE",
    ).length;

    // Jumlah agent yang needs attention (avg util <= 50%)
    const needsAttention = data.filter(
      (agent) => agent.status === "NEEDS ATTENTION",
    ).length;

    // ✅ Jumlah agent yang punya merchant over capacity
    const overCapacity = data.filter(
      (agent) => agent.status === "OVER CAPACITY",
    ).length;

    setAgentStats({
      totalAgents,
      avgUtilization,
      effectiveAgents,
      needsAttention,
      overCapacity,
    });
  };

  // ==================== DATA FETCHING ====================

  // Fetch vendors (once on mount)
  useEffect(() => {
    const fetchVendors = async () => {
      setIsLoadingVendors(true);
      try {
        const data = await vendorService.getVendorsForSelect();
        setVendors(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingVendors(false);
      }
    };
    fetchVendors();
  }, []);

  // Fetch merchant analytics (once on mount)
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      try {
        const data = await merchantService.getMerchantAnalytics(selectedVendor);
        setAnalytics(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
  }, [selectedVendor]);

  // Fetch merchant & agent transaction data (on date change)
  useEffect(() => {
    const fetchTransactionData = async () => {
      setIsLoadingMerchants(true);
      setIsLoadingAgents(true);

      try {
        const params = {
          StartDate: getStartDateTime(),
          EndDate: getEndDateTime(),
        };

        const result =
          await transactionService.GetGroupTransactionSummary(params);

        // Process Merchant Data
        const processedMerchantData = processMerchantData(result.rows);
        setMerchantData(processedMerchantData);
        calculateMerchantStatistics(processedMerchantData);

        // Process Agent Data
        const processedAgentData = processAgentData(result.rows);
        setAgentData(processedAgentData);
        calculateAgentStatistics(processedAgentData);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);

        setMerchantData([]);
        calculateMerchantStatistics([]);

        setAgentData([]);
        calculateAgentStatistics([]);
      } finally {
        setIsLoadingMerchants(false);
        setIsLoadingAgents(false);
      }
    };

    fetchTransactionData();
  }, [selectedDate, selectedVendor]);

  // ==================== RENDER ====================

  return (
    <div className="p-6 space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Merchant Analysis
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Overview of merchant performance and analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Vendor Filter */}
          <SelectInput
            data={[{ vendor_id: "all", name: "All Vendors" }, ...vendors]}
            value={selectedVendor}
            onChange={(value) => setSelectedVendor(value)}
            valueKey="vendor_id"
            labelKey="name"
            placeholder="Select Vendor"
            searchPlaceholder="Search vendor..."
            emptyText="No vendors found"
            disabled={isLoadingVendors}
            className="w-[220px] bg-white/60 backdrop-blur-md border-white/40 shadow-lg hover:bg-white/70"
          />

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal bg-white/60 backdrop-blur-md border-white/40 shadow-lg hover:bg-white/70",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "PPP", { locale: id })
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("2020-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Agents */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Total Agents"
            value={analytics?.total_agents || 0}
            icon={Users}
            borderColor="border-l-gray-500"
            iconColor="text-gray-600"
            iconBgColor="bg-gray-100"
          />
        )}

        {/* Assigned Merchants */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Assigned Merchants"
            value={analytics?.assigned_merchants || 0}
            icon={Store}
            borderColor="border-l-blue-500"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
        )}

        {/* AVG Merchant Utilization */}
        {isLoadingMerchants ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="AVG Merchant UTIL"
            value={`${merchantStats.avgUtilization.toFixed(1)}%`}
            subtitle={`Of daily max (${getFormattedMaxLimit()})`}
            icon={Percent}
            borderColor="border-l-red-500"
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        )}

        {/* Active Assigned */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Active Assigned"
            value={analytics?.active_assigned || 0}
            icon={Activity}
            borderColor="border-l-green-500"
            iconColor="text-green-600"
            iconBgColor="bg-green-100"
          />
        )}

        {/* Low Util Merchants */}
        {isLoadingMerchants ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Low Util Merchants"
            value={merchantStats.lowUtilCount}
            subtitle={`${merchantStats.lowUtilPercentage.toFixed(1)}%`}
            icon={AlertTriangle}
            borderColor="border-l-orange-500"
            iconColor="text-orange-600"
            iconBgColor="bg-orange-100"
          />
        )}

        {/* Inactive Assigned */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Inactive Assigned"
            value={analytics?.inactive_assigned || 0}
            icon={Store}
            borderColor="border-l-red-500"
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        )}

        {/* Merchant Request */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Merchant Request"
            value={analytics?.merchant_request || 0}
            icon={FileText}
            borderColor="border-l-purple-500"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        )}

        {/* Available Merchants */}
        {isLoadingAnalytics ? (
          <Card className="p-4">
            <Skeleton className="h-16 w-full" />
          </Card>
        ) : (
          <StatisticCard
            title="Available Merchants"
            value={analytics?.available_merchants || 0}
            icon={Package}
            borderColor="border-l-cyan-500"
            iconColor="text-cyan-600"
            iconBgColor="bg-cyan-100"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Agent Portfolio Chart - 80% width (4/5) */}
        <div className="lg:col-span-4 h-full">
          <AgentPortfolioChart agentData={agentData} />
        </div>

        {/* Merchant Health Chart - 20% width (1/5) */}
        <div className="lg:col-span-1 h-full">
          <MerchantHealthChart agentData={agentData} />
        </div>
      </div>

      {/* Agent Information Table */}
      <AgentInformation
        agentData={agentData}
        isLoading={isLoadingAgents}
        selectedDate={getDateString()}
      />
      {/* Merchant Information Table */}
      <MerchantInformation
        merchantData={merchantData}
        isLoading={isLoadingMerchants}
        selectedDate={getDateString()}
      />
    </div>
  );
};

export default withRoleProtection(MerchantAnalysisPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
  "StaffFinance",
]);
