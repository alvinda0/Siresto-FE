// components/agent/AgentFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Plus } from "lucide-react";
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
import { Platform } from "@/types/platform";
import { platformService } from "@/services/platform.service";
import { AgentType } from "@/types/agentType";
import { agentTypeService } from "@/services/agentType.service";
import { Agent, AgentQueryParams } from "@/types/agent";
import { agentService } from "@/services/agent.service";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface AgentFilterProps {
  onApplyFilters: (filters: AgentQueryParams) => void;
  onClearFilters?: () => void;
  onCreateClick?: () => void;
}

export const AgentFilter: React.FC<AgentFilterProps> = ({
  onApplyFilters,
  onClearFilters,
  onCreateClick,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingAgentTypes, setLoadingAgentTypes] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Add "All" option to data arrays for SelectInput
  const platformsWithAll = [
    { platform_id: "all", name: "All Platforms" },
    ...platforms,
  ];

  const agentTypesWithAll = [
    { agent_type_id: "all", type: "All Agent Types" },
    ...agentTypes,
  ];

  const agentsWithAll = [
    { agent_id: "all", name: "All Agents" },
    ...agents,
  ];

  const isSuperuser = usePermission("Superuser");
  const isSupervisor = usePermission("Supervisor");
  const canSeePlatform = isSuperuser;
  const canSeeAgentType = isSuperuser || isSupervisor;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [platformId, setPlatformId] = useState<string>("all");
  const [agentTypeId, setAgentTypeId] = useState<string>("all");
  const [agentId, setAgentId] = useState<string>("all");

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "REJECTED", label: "Rejected" },
  ];

  useEffect(() => {
    if (showAdvanced) {
      if (canSeePlatform) {
        fetchPlatforms();
      }
      if (canSeeAgentType) {
        fetchAgentTypes();
      }
      // Always fetch agents for dropdown
      fetchAgents();
    }
  }, [showAdvanced, canSeePlatform, canSeeAgentType]);

  const fetchPlatforms = async () => {
    try {
      setLoadingPlatforms(true);
      const data = await platformService.getPlatformsForSelect();
      setPlatforms(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const fetchAgentTypes = async () => {
    try {
      setLoadingAgentTypes(true);
      // Gunakan method khusus untuk select yang langsung return array
      const data = await agentTypeService.getAgentTypesForSelect();
      setAgentTypes(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setAgentTypes([]);
    } finally {
      setLoadingAgentTypes(false);
    }
  };

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
    const filters: AgentQueryParams = {
      page: 1,
      limit: 100,
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (platformId !== "all") filters.platform_id = platformId;
    if (agentTypeId !== "all") filters.agent_type_id = agentTypeId;
    if (agentId !== "all") filters.agent_id = agentId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setPlatformId("all");
    setAgentTypeId("all");
    setAgentId("all");
    // Use dedicated clear function if provided, otherwise fallback to apply filters
    if (onClearFilters) {
      onClearFilters();
    } else {
      onApplyFilters({ page: 1, limit: 10 });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Search & Filter
          </h3>
        </div>

        {/* Tombol Create New Agent */}
        {onCreateClick && (
          <Button
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            Create New
          </Button>
        )}
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
              placeholder="Search by name, email, or phone..."
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
                data={agentsWithAll}
                value={agentId}
                onChange={setAgentId}
                valueKey="agent_id"
                labelKey="name"
                placeholder="All Agents"
                searchPlaceholder="Search agents..."
                emptyText="No agents found."
                disabled={loadingAgents}
                className="bg-white/50 backdrop-blur-sm"
              />
            </div>
            {loadingAgents && (
              <p className="text-xs text-gray-500 mt-1">
                Loading agents...
              </p>
            )}
          </div>

          {canSeePlatform && (
            <div className="w-[250px]">
              <Label htmlFor="platform">Platform</Label>
              <div className="mt-2">
                <SelectInput
                  data={platformsWithAll}
                  value={platformId}
                  onChange={setPlatformId}
                  valueKey="platform_id"
                  labelKey="name"
                  placeholder="All Platforms"
                  searchPlaceholder="Search platforms..."
                  emptyText="No platforms found."
                  disabled={loadingPlatforms}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
              {loadingPlatforms && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading platforms...
                </p>
              )}
            </div>
          )}

          {canSeeAgentType && (
            <div className="w-[250px]">
              <Label htmlFor="agentType">Agent Type</Label>
              <div className="mt-2">
                <SelectInput
                  data={agentTypesWithAll}
                  value={agentTypeId}
                  onChange={setAgentTypeId}
                  valueKey="agent_type_id"
                  labelKey="type"
                  placeholder="All Agent Types"
                  searchPlaceholder="Search agent types..."
                  emptyText="No agent types found."
                  disabled={loadingAgentTypes}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
              {loadingAgentTypes && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading agent types...
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
