// components/merchant/MerchantRequestFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
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
import { MerchantRequestQueryParams } from "@/types/merchantRequest";
import { Agent } from "@/types/agent";
import { agentService } from "@/services/agent.service";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface MerchantRequestFilterProps {
  onApplyFilters: (filters: MerchantRequestQueryParams) => void;
  onClearFilters?: () => void;
}

export const MerchantRequestFilter: React.FC<MerchantRequestFilterProps> = ({
  onApplyFilters,
  onClearFilters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [agentId, setAgentId] = useState<string>("all");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "APPROVED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ];

  useEffect(() => {
    if (showAdvanced) {
      fetchAgents();
    }
  }, [showAdvanced]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const data = await agentService.getAgentsForSelect();
      setAgents(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const applyFilters = () => {
    const filters: MerchantRequestQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (agentId !== "all") filters.agent_id = agentId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setAgentId("all");
    
    if (onClearFilters) {
      onClearFilters();
    } else {
      onApplyFilters({ page: 1, limit: 10 });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Search & Filter
        </h3>
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
              placeholder="Search by agent name..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

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
          <Filter className="w-4 h-4" />
          Advanced
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </Button>

        <Button
          onClick={handleClear}
          variant="outline"
          className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
          <div className="w-[300px]">
            <Label htmlFor="agentId">Agent</Label>
            <div className="mt-2">
              <SelectInput
                data={[{ agent_id: "all", name: "All Agents" }, ...agents]}
                value={agentId}
                onChange={setAgentId}
                valueKey="agent_id"
                labelKey="name"
                placeholder="Select agent"
                disabled={loadingAgents}
                className="bg-white/50 backdrop-blur-sm"
                emptyText="No agents found"
                searchPlaceholder="Search agents..."
              />
            </div>
            {loadingAgents && (
              <p className="text-xs text-gray-500 mt-1">
                Loading agents...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};