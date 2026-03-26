"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { usePermission } from "@/components/ProtectedRoles";
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
import { Agent } from "@/types/agent";
import { Vendor } from "@/types/vendor";
import { Platform } from "@/types/platform";
import { MerchantType } from "@/types/merchant-type";
import { Merchant } from "@/types/merchant";
import { agentService } from "@/services/agent.service";
import { vendorService } from "@/services/vendor.service";
import { platformService } from "@/services/platform.service";
import { merchantTypeService } from "@/services/merchant-type.service";
import { merchantService } from "@/services/merchant.service";
import { MerchantQueryParams } from "@/types/merchant";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface MerchantFilterProps {
  onApplyFilters: (filters: MerchantQueryParams) => void;
}

export const MerchantFilter: React.FC<MerchantFilterProps> = ({
  onApplyFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Check permission untuk Superuser dan Supervisor
  const isSuperuser = usePermission("Superuser");
  const isSupervisor = usePermission("Supervisor");
  const canSeeAdvanced = isSuperuser || isSupervisor;

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [environment, setEnvironment] = useState<string>("all");
  const [isAuto, setIsAuto] = useState<string>("all");
  const [vendorId, setVendorId] = useState<string>("all");
  const [agentId, setAgentId] = useState<string>("all");
  const [platformId, setPlatformId] = useState<string>("all");
  const [merchantTypeId, setMerchantTypeId] = useState<string>("all");
  const [merchantId, setMerchantId] = useState<string>("all");

  // Dropdown data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [merchantTypes, setMerchantTypes] = useState<MerchantType[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  // Loading states
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingMerchantTypes, setLoadingMerchantTypes] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const environmentOptions = [
    { value: "DEVELOPMENT", label: "Development" },
    { value: "LIVE", label: "Live" },
  ];

  const isAutoOptions = [
    { value: "True", label: "True" },
    { value: "False", label: "False" },
  ];

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const data = await vendorService.getVendors();
        const vendors = data.data || [];
        setVendors(vendors);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error loading vendors:', errorMessage);
        toast.error(errorMessage);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
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

  // Fetch platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const data = await platformService.getPlatformsForSelect();
        setPlatforms(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error loading platforms:', errorMessage);
        toast.error(errorMessage);
        setPlatforms([]);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Fetch merchant types
  useEffect(() => {
    const fetchMerchantTypes = async () => {
      try {
        setLoadingMerchantTypes(true);
        const data = await merchantTypeService.getMerchantTypesForSelect();
        setMerchantTypes(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Error loading merchant types:', errorMessage);
        toast.error(errorMessage);
        setMerchantTypes([]);
      } finally {
        setLoadingMerchantTypes(false);
      }
    };

    fetchMerchantTypes();
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
        console.error('Error loading merchants:', errorMessage);
        toast.error(errorMessage);
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, []);

  const applyFilters = () => {
    const filters: MerchantQueryParams = {
      page: 1,
      limit: 10, // ✅ KIRIM LIMIT SEPERTI TRANSACTION
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (environment !== "all") filters.environment = environment;
    if (isAuto !== "all") filters.is_auto = isAuto;
    if (vendorId !== "all") filters.vendor_id = vendorId;
    if (agentId !== "all") filters.agent_id = agentId;
    if (platformId !== "all") filters.platform_id = platformId;
    if (merchantTypeId !== "all") filters.merchant_type_id = merchantTypeId;
    if (merchantId !== "all") filters.merchant_id = merchantId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    // Reset semua state
    setSearch("");
    setStatus("all");
    setEnvironment("all");
    setIsAuto("all");
    setVendorId("all");
    setAgentId("all");
    setPlatformId("all");
    setMerchantTypeId("all");
    setMerchantId("all");

    // Apply filter kosong dengan limit default
    onApplyFilters({ page: 1, limit: 10 }); 
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      {/* Inline Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[250px]">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by merchant name..."
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
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Environment */}
        <div className="w-[180px]">
          <Label htmlFor="environment" className="text-sm font-medium">
            Environment
          </Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger
              id="environment"
              className="mt-1.5 bg-white/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="All Environments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              {environmentOptions.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Is Auto */}
        <div className="w-[150px]">
          <Label htmlFor="isAuto" className="text-sm font-medium">
            Is Auto
          </Label>
          <Select value={isAuto} onValueChange={setIsAuto}>
            <SelectTrigger
              id="isAuto"
              className="mt-1.5 bg-white/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Is Auto</SelectItem>
              {isAutoOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
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

        {/* Advanced Button - Only for Superuser/Supervisor */}
        {canSeeAdvanced && (
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
        )}

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
        {showAdvanced && canSeeAdvanced && (
          <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
            {/* Merchant */}
            <div className="w-[200px]">
              <Label htmlFor="merchantId" className="text-sm font-medium">
                Merchant
              </Label>
              <div className="mt-1.5">
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
                  data={vendors}
                  value={vendorId}
                  onChange={setVendorId}
                  valueKey="vendor_id"
                  labelKey="name"
                  placeholder="All Vendors"
                  searchPlaceholder="Search vendors..."
                  emptyText="No vendors found"
                  disabled={loadingVendors}
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
                  data={agents}
                  value={agentId}
                  onChange={setAgentId}
                  valueKey="agent_id"
                  labelKey="name"
                  placeholder="All Agents"
                  searchPlaceholder="Search agents..."
                  emptyText="No agents found"
                  disabled={loadingAgents}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Platform */}
            <div className="w-[200px]">
              <Label htmlFor="platform" className="text-sm font-medium">
                Platform
              </Label>
              <div className="mt-1.5">
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
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Merchant Type */}
            <div className="w-[200px]">
              <Label htmlFor="merchantType" className="text-sm font-medium">
                Merchant Type
              </Label>
              <div className="mt-1.5">
                <SelectInput
                  data={merchantTypes}
                  value={merchantTypeId}
                  onChange={setMerchantTypeId}
                  valueKey="merchant_type_id"
                  labelKey="name"
                  placeholder="All Types"
                  searchPlaceholder="Search types..."
                  emptyText="No types found"
                  disabled={loadingMerchantTypes}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
