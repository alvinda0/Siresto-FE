// components/wallet-merchant/WalletMerchantFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { WalletMerchantQueryParams } from "@/types/wallet-merchant";
import { merchantService } from "@/services/merchant.service";
import { agentService } from "@/services/agent.service";
import { platformService } from "@/services/platform.service";
import { vendorService } from "@/services/vendor.service";
import { Merchant } from "@/types/merchant";
import { Agent } from "@/types/agent";
import { Platform } from "@/types/platform";
import { Vendor } from "@/types/vendor";
import { SelectInput } from "@/components/SelectInput";

interface WalletMerchantFilterProps {
  onApplyFilters: (filters: WalletMerchantQueryParams) => void;
}

export const WalletMerchantFilter: React.FC<WalletMerchantFilterProps> = ({
  onApplyFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [status, setStatus] = useState("");

  // State untuk dropdown options
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Fetch merchants dan agents saat component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMerchants(true);
        const merchantData = await merchantService.getMerchants({
          page: 1,
          limit: 1000,
        });
        setMerchants(merchantData.data ?? []);
      } catch (error) {
        console.error("Failed to fetch merchants:", error);
      } finally {
        setLoadingMerchants(false);
      }

      try {
        setLoadingAgents(true);
        const agentData = await agentService.getAgents({
          page: 1,
          limit: 100,
        });
        setAgents(agentData.data ?? []);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
      } finally {
        setLoadingAgents(false);
      }

      try {
        setLoadingPlatforms(true);
        const platformData = await platformService.getPlatformsForSelect();
        setPlatforms(platformData ?? []);
      } catch (error) {
        console.error("Failed to fetch platforms:", error);
      } finally {
        setLoadingPlatforms(false);
      }

      try {
        setLoadingVendors(true);
        const vendorData = await vendorService.getVendors({
          page: 1,
          limit: 100,
        });
        setVendors(vendorData.data ?? []);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = () => {
    const filters: WalletMerchantQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) filters.search = search.trim();
    if (merchantId) filters.merchant_id = merchantId;
    if (agentId) filters.agent_id = agentId;
    if (platformId) filters.platform_id = platformId;
    if (vendorId) filters.vendor_id = vendorId;
    if (status) filters.status = status;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setMerchantId("");
    setAgentId("");
    setPlatformId("");
    setVendorId("");
    setStatus("");
    // Reset ke kondisi default tanpa filter
    const defaultFilters: WalletMerchantQueryParams = {
      page: 1,
      limit: 10,
    };
    onApplyFilters(defaultFilters);
  };

  const hasActiveFilters = search || merchantId || agentId || platformId || vendorId || status;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[300px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by merchant or agent name..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="w-[200px]">
          <Label htmlFor="status">Status</Label>
          <SelectInput
            data={[
              { value: "ACTIVE", label: "Active" },
              { value: "PENDING", label: "Pending" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "REJECTED", label: "Rejected" },
            ]}
            value={status}
            onChange={setStatus}
            valueKey="value"
            labelKey="label"
            placeholder="All Status"
            searchPlaceholder="Search status..."
            emptyText="No status found"
            className="mt-2 bg-white/50 backdrop-blur-sm"
          />
        </div>

        <Button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
        >
          Apply
        </Button>

        <Button
          onClick={() => setShowAdvanced(!showAdvanced)}
          variant="outline"
          className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
        >
          <Filter className="w-4 h-4 mr-2" />
          Advanced
          <ChevronDown
            className={`w-4 h-4 ml-2 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </Button>

        {hasActiveFilters && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="bg-red-500/10 hover:bg-red-500/20 border-red-200 text-red-700"
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
          <div className="w-[250px]">
            <Label htmlFor="platformId">Platform</Label>
            <SelectInput
              data={platforms}
              value={platformId}
              onChange={setPlatformId}
              valueKey="platform_id"
              labelKey="name"
              placeholder="All Platforms"
              searchPlaceholder="Search platforms..."
              emptyText="No platforms found"
              disabled={loadingPlatforms}
              className="mt-2 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="w-[250px]">
            <Label htmlFor="vendorId">Vendor</Label>
            <SelectInput
              data={vendors}
              value={vendorId}
              onChange={setVendorId}
              valueKey="vendor_id"
              labelKey="name"
              placeholder="All Vendors"
              searchPlaceholder="Search vendors..."
              emptyText="No vendors found"
              disabled={loadingVendors}
              className="mt-2 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="w-[250px]">
            <Label htmlFor="merchantId">Merchant</Label>
            <SelectInput
              data={merchants}
              value={merchantId}
              onChange={setMerchantId}
              valueKey="merchant_id"
              labelKey="name"
              placeholder="All Merchants"
              searchPlaceholder="Search merchants..."
              emptyText="No merchants found"
              disabled={loadingMerchants}
              className="mt-2 bg-white/50 backdrop-blur-sm"
            />
          </div>

          <div className="w-[250px]">
            <Label htmlFor="agentId">Agent</Label>
            <SelectInput
              data={agents}
              value={agentId}
              onChange={setAgentId}
              valueKey="agent_id"
              labelKey="name"
              placeholder="All Agents"
              searchPlaceholder="Search agents..."
              emptyText="No agents found"
              disabled={loadingAgents}
              className="mt-2 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
