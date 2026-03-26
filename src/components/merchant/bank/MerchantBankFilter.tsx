"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
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
import { Merchant } from "@/types/merchant";
import { Agent } from "@/types/agent";
import { merchantService } from "@/services/merchant.service";
import { agentService } from "@/services/agent.service";
import { BankMerchantQueryParams } from "@/types/bank-merchant";

interface BankMerchantFilterProps {
  onApplyFilters: (filters: BankMerchantQueryParams) => void;
}

export const BankMerchantFilter: React.FC<BankMerchantFilterProps> = ({
  onApplyFilters,
}) => {
  const isSuperuser = usePermission("Superuser");
  const isSupervisor = usePermission("Supervisor");
  const canSeeAdvanced = isSuperuser || isSupervisor;

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [merchantId, setMerchantId] = useState<string>("all");
  const [agentId, setAgentId] = useState<string>("all");

  const statusOptions = [
    { value: "Pending", label: "Pending" },
    { value: "Accepted", label: "Accepted" },
    { value: "Rejected", label: "Rejected" },
    { value: "Revised", label: "Revised" },
  ];

  useEffect(() => {
    if (canSeeAdvanced) {
      fetchMerchants();
      fetchAgents();
    }
  }, [canSeeAdvanced]);

  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const data = await merchantService.getMerchants({ page: 1, limit: 500 });
      setMerchants(data.data || []);
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
      setMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const data = await agentService.getAgentsForSelect();
      setAgents(data || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const applyFilters = () => {
    const filters: BankMerchantQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (merchantId !== "all") filters.merchant_id = merchantId;
    if (agentId !== "all") filters.agent_id = agentId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setMerchantId("all");
    setAgentId("all");
    onApplyFilters({ page: 1, limit: 10 });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
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
              placeholder="Search by name, account number..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Agent Filter - Advanced Only */}
        {canSeeAdvanced && (
          <div className="w-[250px]">
            <Label htmlFor="agent">Agent</Label>
            <div className="mt-2">
              <SelectInput
                data={[{ agent_id: "all", name: "All Agents" }, ...agents]}
                value={agentId}
                onChange={setAgentId}
                valueKey="agent_id"
                labelKey="name"
                placeholder="Select agent..."
                searchPlaceholder="Search agent..."
                emptyText={loadingAgents ? "Loading agents..." : "No agents found"}
                disabled={loadingAgents}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Merchant Filter - Advanced Only */}
        {canSeeAdvanced && (
          <div className="w-[250px]">
            <Label htmlFor="merchant">Merchant</Label>
            <div className="mt-2">
              <SelectInput
                data={[{ merchant_id: "all", name: "All Merchants" }, ...merchants]}
                value={merchantId}
                onChange={setMerchantId}
                valueKey="merchant_id"
                labelKey="name"
                placeholder="Select merchant..."
                searchPlaceholder="Search merchant..."
                emptyText={loadingMerchants ? "Loading merchants..." : "No merchants found"}
                disabled={loadingMerchants}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="w-[200px]">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger
              id="status"
              className="mt-2 bg-white/50 backdrop-blur-sm"
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

        {/* Action Buttons */}
        <Button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
        >
          Apply
        </Button>

        <Button
          onClick={handleClear}
          variant="outline"
          className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
};