// components/UserFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Plus } from "lucide-react";
import { UserQueryParams } from "@/types/user";
import { usePermission } from "@/components/ProtectedRoles";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/SelectInput";
import { Agent } from "@/types/agent";
import { agentService } from "@/services/agent.service";
import { Platform } from "@/types/platform";
import { platformService } from "@/services/platform.service";
import { roleService } from "@/services/role.service";
import { Role } from "@/types/role";

// Constants untuk placeholder values
const PLACEHOLDER_ALL = "__all__";

interface UserFilterProps {
  onApplyFilters: (filters: UserQueryParams) => void;
  onCreateClick?: () => void;
  onClearFilters?: () => void; // Add new prop for clear functionality
}

export const UserFilter: React.FC<UserFilterProps> = ({ onApplyFilters, onCreateClick, onClearFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const isPartnerOwner = usePermission("Superuser");
  const isPlatformOwner = usePermission("Superuser");
  const isAgentOwner = usePermission("Superuser");
  const canSeePlatform = isPartnerOwner;
  const canSeeAgent = isPartnerOwner || isPlatformOwner;

  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState<string>(PLACEHOLDER_ALL);
  const [platformId, setPlatformId] = useState<string>(PLACEHOLDER_ALL);
  const [agentId, setAgentId] = useState<string>(PLACEHOLDER_ALL);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (canSeePlatform && showAdvanced) {
      fetchPlatforms();
    }
  }, [canSeePlatform, showAdvanced]);

  useEffect(() => {
    if (canSeeAgent && showAdvanced) {
      fetchAgents();
    }
  }, [canSeeAgent, showAdvanced]);

  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const fetchPlatforms = async () => {
    try {
      setLoadingPlatforms(true);
      const data = await platformService.getPlatformsForSelect();
      setPlatforms(data);
    } catch (error) {
      console.error("Failed to fetch platforms:", error);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const data = await agentService.getAgentsForSelect();
      setAgents(data);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const getFilteredRoles = () => {
    // Filter roles berdasarkan permission user
    if (isPartnerOwner) {
      // Partner Owner bisa melihat semua role kecuali PartnerOwner dan di atas
      return roles.filter(r => !["PartnerOwner", "Superuser", "System"].includes(r.role_name));
    }
    if (isPlatformOwner) {
      // Platform Owner bisa melihat PlatformStaff, AgentOwner, AgentStaff
      return roles.filter(r => ["PlatformStaff", "AgentOwner", "AgentStaff"].includes(r.role_name));
    }
    if (isAgentOwner) {
      // Agent Owner hanya bisa melihat AgentStaff
      return roles.filter(r => r.role_name === "AgentStaff");
    }
    // Default: tampilkan semua
    return roles;
  };

  const applyFilters = () => {
    const filters: UserQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) {
      filters.search = search.trim();
    }
    if (roleId !== PLACEHOLDER_ALL) {
      filters.role = roleId;
    }
    if (platformId !== PLACEHOLDER_ALL) {
      filters.platform_id = platformId;
    }
    if (agentId !== PLACEHOLDER_ALL) {
      filters.agent_id = agentId;
    }

    onApplyFilters(filters);
  };

  const handleClear = () => {
    // Reset all state values
    setSearch("");
    setRoleId(PLACEHOLDER_ALL);
    setPlatformId(PLACEHOLDER_ALL);
    setAgentId(PLACEHOLDER_ALL);
    
    // Use the dedicated clear function if provided, otherwise use apply filters
    if (onClearFilters) {
      onClearFilters();
    } else {
      // Fallback: call onApplyFilters with only basic pagination
      onApplyFilters({ 
        page: 1, 
        limit: 10 
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
        </div>
        
        {/* Tombol Create User */}
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
          <Label htmlFor="role">Role</Label>
          <div className="mt-2">
            <SelectInput
              data={[{ role_id: PLACEHOLDER_ALL, role_name: "All Roles" }, ...getFilteredRoles()]}
              value={roleId}
              onChange={setRoleId}
              valueKey="role_id"
              labelKey="role_name"
              placeholder="All Roles"
              searchPlaceholder="Search roles..."
              emptyText="No roles found"
              disabled={loadingRoles}
              className="bg-white/50 backdrop-blur-sm"
            />
          </div>
          {loadingRoles && (
            <p className="text-xs text-gray-500 mt-1">Loading roles...</p>
          )}
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
            className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? "rotate-180" : ""
              }`}
          />
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

      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
          {canSeePlatform && (
            <div className="w-[250px]">
              <Label htmlFor="platform">Platform</Label>
              <div className="mt-2">
                <SelectInput
                  data={[{ platform_id: PLACEHOLDER_ALL, name: "All Platforms" }, ...platforms]}
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
              {loadingPlatforms && (
                <p className="text-xs text-gray-500 mt-1">Loading platforms...</p>
              )}
            </div>
          )}

          {canSeeAgent && (
            <div className="w-[250px]">
              <Label htmlFor="agent">Agent</Label>
              <div className="mt-2">
                <SelectInput
                  data={[{ agent_id: PLACEHOLDER_ALL, name: "All Agents" }, ...agents]}
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
              {loadingAgents && (
                <p className="text-xs text-gray-500 mt-1">Loading agents...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};