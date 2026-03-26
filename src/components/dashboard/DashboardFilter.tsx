"use client";

import { useState, useEffect } from "react";
import { Filter, X, Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { partnerService } from "@/services/partner.service";
import { platformService } from "@/services/platform.service";
import { agentService } from "@/services/agent.service";
import { merchantService } from "@/services/merchant.service";
import { Partner } from "@/types/partner";
import { Platform } from "@/types/platform";
import { Agent } from "@/types/agent";
import { Merchant } from "@/types/merchant";

export interface DashboardFilters {
  status?: string;
  partner_id?: string;
  platform_id?: string;
  agent_id?: string;
  merchant_id?: string;
}

interface DashboardFilterProps {
  onFilterChange: (filters: DashboardFilters) => void;
}

const DashboardFilter = ({ onFilterChange }: DashboardFilterProps) => {
  // SINGLE STATE untuk semua filters
  const [filters, setFilters] = useState<DashboardFilters>({});

  // Dropdown data states
  const [partners, setPartners] = useState<Partner[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Merchant combobox state
  const [openMerchant, setOpenMerchant] = useState(false);

  // Load dropdown data - HANYA SEKALI
  useEffect(() => {
    const loadDropdownData = async () => {
      setIsLoading(true);
      try {
        const [partnersData, platformsData, agentsData, merchantsResponse] =
          await Promise.all([
            partnerService.getPartners(),
            platformService.getPlatformsForSelect(),
            agentService.getAgentsForSelect(),
            merchantService.getMerchants({ limit: 100 }),
          ]);

        setPartners(partnersData);
        setPlatforms(platformsData);
        setAgents(agentsData);
        setMerchants(merchantsResponse.data);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDropdownData();
  }, []); // EMPTY DEPENDENCY - hanya run sekali

  // HELPER: Update filter dan langsung notify parent
  const updateFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      
      // Jika value kosong atau "all", hapus key dari object
      if (!value || value === "all") {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      
      // LANGSUNG CALL onFilterChange dengan newFilters
      onFilterChange(newFilters);
      
      return newFilters;
    });
  };

  // Handlers
  const handleStatusChange = (value: string) => {
    updateFilter("status", value);
  };

  const handlePartnerChange = (value: string) => {
    updateFilter("partner_id", value);
  };

  const handlePlatformChange = (value: string) => {
    updateFilter("platform_id", value);
  };

  const handleAgentChange = (value: string) => {
    updateFilter("agent_id", value);
  };

  const handleMerchantChange = (value: string) => {
    updateFilter("merchant_id", value);
    setOpenMerchant(false);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({}); // Clear filters di parent juga
  };

  const hasActiveFilters = Object.keys(filters).length > 0;
  const activeFiltersCount = Object.keys(filters).length;

  // Get selected merchant name
  const selectedMerchantName = merchants.find(
    (m) => m.merchant_id === filters.merchant_id
  )?.name;

  return (
    <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-xl p-5 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          Filter Transactions
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Status
          </label>
          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gray-200 hover:border-indigo-400 transition-colors">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expire">Expire</SelectItem>
              <SelectItem value="cancel">Cancel</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Partner Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Partner
          </label>
          <Select
            value={filters.partner_id || "all"}
            onValueChange={handlePartnerChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gray-200 hover:border-indigo-400 transition-colors">
              <SelectValue placeholder="All Partners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partners</SelectItem>
              {partners.map((partner) => (
                <SelectItem key={partner.partner_id} value={partner.partner_id}>
                  {partner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platform Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Platform
          </label>
          <Select
            value={filters.platform_id || "all"}
            onValueChange={handlePlatformChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gray-200 hover:border-indigo-400 transition-colors">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              {platforms.map((platform) => (
                <SelectItem
                  key={platform.platform_id}
                  value={platform.platform_id}
                >
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agent Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Agent
          </label>
          <Select
            value={filters.agent_id || "all"}
            onValueChange={handleAgentChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm border-gray-200 hover:border-indigo-400 transition-colors">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.agent_id} value={agent.agent_id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Merchant Filter - COMBOBOX WITH SEARCH */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Merchant
          </label>
          <Popover open={openMerchant} onOpenChange={setOpenMerchant}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openMerchant}
                className="w-full justify-between bg-white/50 backdrop-blur-sm border-gray-200 hover:border-indigo-400 transition-colors h-10"
                disabled={isLoading}
              >
                <span className="truncate">
                  {filters.merchant_id && selectedMerchantName
                    ? selectedMerchantName
                    : "All Merchants"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput
                  placeholder="Search merchant..."
                  className="h-9"
                />
                <CommandEmpty>No merchant found.</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  <CommandItem
                    value="all-merchants"
                    onSelect={() => handleMerchantChange("")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !filters.merchant_id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Merchants
                  </CommandItem>
                  {merchants.map((merchant) => (
                    <CommandItem
                      key={merchant.merchant_id}
                      value={merchant.name}
                      onSelect={() => handleMerchantChange(merchant.merchant_id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          filters.merchant_id === merchant.merchant_id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {merchant.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>{activeFiltersCount} filter(s) applied</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator - HANYA untuk initial load */}
      {isLoading && (
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600" />
          Loading filter options...
        </div>
      )}
    </div>
  );
};

export default DashboardFilter;