// components/audit/AuditLogFilters.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInput } from "@/components/SelectInput";
import { Search, Filter, X } from "lucide-react";
import {
  AuditLogQueryParams,
  ACTION_OPTIONS,
  RESOURCE_OPTIONS,
} from "@/types/audit";

interface AuditLogFiltersProps {
  onApplyFilters: (filters: AuditLogQueryParams) => void;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  onApplyFilters,
}) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [resource, setResource] = useState<string>("all");
  const [action, setAction] = useState<string>("all");

  const statusOptions = [
    { value: "true", label: "Success" },
    { value: "false", label: "Failed" },
  ];

  const applyFilters = () => {
    const filters: AuditLogQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status === "true";
    if (resource !== "all") filters.resource = resource;
    if (action !== "all") filters.action = action;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setResource("all");
    setAction("all");
    // Pass only pagination parameters to clear all filters
    onApplyFilters({ 
      page: 1, 
      limit: 10
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Search & Filter Audit Logs
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
              placeholder="Search by username, user ID..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="w-[180px]">
          <Label htmlFor="status">Status</Label>
          <SelectInput
            data={[
              { value: "all", label: "All Status" },
              ...statusOptions,
            ]}
            value={status}
            onChange={setStatus}
            valueKey="value"
            labelKey="label"
            placeholder="All Status"
            searchPlaceholder="Search status..."
            emptyText="No status options found"
            className="mt-2 bg-white/50 backdrop-blur-sm"
          />
        </div>

        <div className="w-[200px]">
          <Label htmlFor="resource">Resource</Label>
          <SelectInput
            data={[
              { value: "all", label: "All Resources" },
              ...RESOURCE_OPTIONS,
            ]}
            value={resource}
            onChange={setResource}
            valueKey="value"
            labelKey="label"
            placeholder="All Resources"
            searchPlaceholder="Search resources..."
            emptyText="No resource options found"
            className="mt-2 bg-white/50 backdrop-blur-sm"
          />
        </div>

        <div className="w-[180px]">
          <Label htmlFor="action">Action</Label>
          <SelectInput
            data={[
              { value: "all", label: "All Actions" },
              ...ACTION_OPTIONS,
            ]}
            value={action}
            onChange={setAction}
            valueKey="value"
            labelKey="label"
            placeholder="All Actions"
            searchPlaceholder="Search actions..."
            emptyText="No action options found"
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