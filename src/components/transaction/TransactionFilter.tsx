// components/transaction/TransactionFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Download,
  RefreshCw,
  Plus,
} from "lucide-react";
import { TransactionQueryParams } from "@/types/transaction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectInput } from "@/components/SelectInput";
import { cn } from "@/lib/utils";
import { platformService } from "@/services/platform.service";
import { agentService } from "@/services/agent.service";
import { merchantService } from "@/services/merchant.service";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TransactionFilterProps {
  onApplyFilters: (filters: TransactionQueryParams) => void;
  onDownloadClick: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

export const TransactionFilter: React.FC<TransactionFilterProps> = ({
  onApplyFilters,
  onDownloadClick,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const router = useRouter();
  // Filter states
  const [transactionUuid, setTransactionUuid] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [processingStatus, setProcessingStatus] = useState<string>("all");
  const [platformId, setPlatformId] = useState<string>("all");
  const [agentId, setAgentId] = useState<string>("all");
  const [merchantId, setMerchantId] = useState<string>("all");
  const [vendorId, setVendorId] = useState<string>("all");

  // Dropdown data
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);

  // Loading states
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Fetch platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const data = await platformService.getPlatformsForSelect();
        setPlatforms(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setPlatforms([]);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const data = await agentService.getAgentsForSelect();
        setAgents(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []);

  // Fetch merchants
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoadingMerchants(true);
        const data = await merchantService.getMerchantsForSelect();
        setMerchants(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, []);

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const data = await vendorService.getVendorsForSelect();
        setVendors(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  const applyFilters = () => {
    const filters: TransactionQueryParams = {
      page: 1,
      limit: 10,
    };

    if (transactionUuid.trim()) filters.search = transactionUuid.trim();
    if (status !== "all") filters.status = status;
    if (processingStatus !== "all")
      filters.processing_status = processingStatus;
    if (platformId !== "all") filters.platform_id = platformId;
    if (agentId !== "all") filters.agent_id = agentId;
    if (merchantId !== "all") filters.merchant_id = merchantId;
    if (vendorId !== "all") filters.vendor_id = vendorId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    // Reset semua state
    setTransactionUuid("");
    setStatus("all");
    setProcessingStatus("all");
    setPlatformId("all");
    setAgentId("all");
    setMerchantId("all");
    setVendorId("all");

    // Apply filter kosong
    onApplyFilters({ page: 1, limit: 10 });
  };

  const handleCreateTransaction = () => {
    router.push("/qris-payment");
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      {/* Header with Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Search & Filter
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleCreateTransaction}
            className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg font-medium"
          >
            <Plus className="w-4 h-4" />
            Test QRIS
          </Button>
          {/* Auto Refresh Toggle */}
          <Button
            onClick={onToggleAutoRefresh}
            variant="outline"
            className={cn(
              "transition-all duration-200",
              autoRefresh
                ? "bg-green-500/20 hover:bg-green-500/30 border-green-500 text-green-700"
                : "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700",
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4 mr-2", autoRefresh && "animate-spin")}
            />
            Auto Refresh: {autoRefresh ? "ON" : "OFF"}
          </Button>

          <Button
            onClick={onDownloadClick}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
        </div>
      </div>

      {/* Inline Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search Transaction UUID */}
        <div className="flex-1 min-w-[200px]">
          <Label htmlFor="search" className="text-sm font-medium">
            Transaction UUID
          </Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              value={transactionUuid}
              onChange={(e) => setTransactionUuid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by transaction UUID..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Status */}
        <div className="w-40">
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="status"
              className="mt-1.5 bg-white/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="cancel">Cancelled</SelectItem>
              <SelectItem value="expire">Expired</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Processing Status */}
        <div className="w-[180px]">
          <Label htmlFor="processing-status" className="text-sm font-medium">
            Processing Status
          </Label>
          <Select value={processingStatus} onValueChange={setProcessingStatus}>
            <SelectTrigger
              id="processing-status"
              className="mt-1.5 bg-white/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="All Processing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Processing</SelectItem>
              <SelectItem value="on_going">On Going</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="fail">Fail</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Apply Button */}
        <Button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg h-10"
        >
          Apply
        </Button>

        {/* Advanced Button */}
        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700 h-10"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </Button>

        {/* Clear Button */}
        <Button
          onClick={handleClear}
          variant="outline"
          className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700 h-10"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
          {/* Platform */}
          <div className="w-[200px]">
            <Label htmlFor="platform" className="text-sm font-medium">
              Platform
            </Label>
            <div className="mt-1.5">
              <SelectInput
                data={[
                  { platform_id: "all", name: "All Platforms" },
                  ...platforms,
                ]}
                value={platformId}
                onChange={setPlatformId}
                valueKey="platform_id"
                labelKey="name"
                placeholder="All Platforms"
                searchPlaceholder="Search platform..."
                emptyText={
                  loadingPlatforms
                    ? "Loading platforms..."
                    : "No platform found."
                }
                disabled={loadingPlatforms}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Agent */}
          <div className="w-[200px]">
            <Label htmlFor="agent" className="text-sm font-medium">
              Agent
            </Label>
            <div className="mt-1.5">
              <SelectInput
                data={[{ agent_id: "all", name: "All Agents" }, ...agents]}
                value={agentId}
                onChange={setAgentId}
                valueKey="agent_id"
                labelKey="name"
                placeholder="All Agents"
                searchPlaceholder="Search agent..."
                emptyText={
                  loadingAgents ? "Loading agents..." : "No agent found."
                }
                disabled={loadingAgents}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Merchant */}
          <div className="w-[250px]">
            <Label htmlFor="merchant" className="text-sm font-medium">
              Merchant
            </Label>
            <div className="mt-1.5">
              <SelectInput
                data={[
                  { merchant_id: "all", name: "All Merchants" },
                  ...merchants,
                ]}
                value={merchantId}
                onChange={setMerchantId}
                valueKey="merchant_id"
                labelKey="name"
                placeholder="All Merchants"
                searchPlaceholder="Search merchant..."
                emptyText={
                  loadingMerchants
                    ? "Loading merchants..."
                    : "No merchant found."
                }
                disabled={loadingMerchants}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Vendor */}
          <div className="w-[200px]">
            <Label htmlFor="vendor" className="text-sm font-medium">
              Vendor
            </Label>
            <div className="mt-1.5">
              <SelectInput
                data={[{ vendor_id: "all", name: "All Vendors" }, ...vendors]}
                value={vendorId}
                onChange={setVendorId}
                valueKey="vendor_id"
                labelKey="name"
                placeholder="All Vendors"
                searchPlaceholder="Search vendor..."
                emptyText={
                  loadingVendors ? "Loading vendors..." : "No vendor found."
                }
                disabled={loadingVendors}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
