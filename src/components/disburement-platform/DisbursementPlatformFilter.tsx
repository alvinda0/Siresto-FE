// components/disbursement-platform/DisbursementPlatformFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Download } from "lucide-react";
import { DisbursementPlatformQueryParams } from "@/types/disbursement-platform";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { platformService } from "@/services/platform.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { SelectInput } from "@/components/SelectInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DisbursementPlatformFilterProps {
  onApplyFilters: (filters: DisbursementPlatformQueryParams) => void;
  onExport: () => void;
}

export const DisbursementPlatformFilter: React.FC < 
  DisbursementPlatformFilterProps
> = ({ onApplyFilters, onExport }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [platformId, setPlatformId] = useState<string>("all");

  // Dropdown data
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  // Fetch platforms for dropdown
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const response = await platformService.getPlatforms({
          page: 1,
          limit: 100,
        });
        setPlatforms(response.data || []);
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

  const applyFilters = () => {
    const filters: DisbursementPlatformQueryParams = {
      page: 1,
      limit: 10,
      type: "IDR", // Filter khusus untuk IDR
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (platformId !== "all") filters.platform_id = platformId;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setPlatformId("all");
    // Apply default filters to reload all data - reset to initial state
    const defaultFilters: DisbursementPlatformQueryParams = {
      page: 1,
      limit: 10,
      type: "IDR",
    };
    onApplyFilters(defaultFilters);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      {/* Inline Filters */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
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
              placeholder="Search by platform name or account..."
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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
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

        <Button
          onClick={onExport}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg h-10"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
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
                data={[{ platform_id: "all", name: "All Platforms" }, ...platforms]}
                value={platformId}
                onChange={setPlatformId}
                valueKey="platform_id"
                labelKey="name"
                placeholder={loadingPlatforms ? "Loading..." : "All Platforms"}
                disabled={loadingPlatforms}
                className="bg-white/50 backdrop-blur-sm"
                searchPlaceholder="Search platforms..."
                emptyText="No platforms found."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};