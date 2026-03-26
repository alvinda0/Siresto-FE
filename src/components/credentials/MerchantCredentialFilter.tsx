// components/credentials/MerchantCredentialFilter.tsx
"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
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
import { MerchantCredentialQueryParams } from "@/types/credentials";

interface MerchantCredentialFilterProps {
  onApplyFilters: (filters: MerchantCredentialQueryParams) => void;
}

export const MerchantCredentialFilter: React.FC<
  MerchantCredentialFilterProps
> = ({ onApplyFilters }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [environment, setEnvironment] = useState<string>("all");

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "PENDING", label: "Pending" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const environmentOptions = [
    { value: "LIVE", label: "Live" },
    { value: "DEVELOPMENT", label: "Development" },
  ];

  const applyFilters = () => {
    const filters: MerchantCredentialQueryParams = {};

    if (name.trim()) filters.name = name.trim();
    if (status !== "all") filters.status = status;
    if (environment !== "all") filters.environment = environment;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setName("");
    setStatus("all");
    setEnvironment("all");
    onApplyFilters({});
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">
          Search & Filter Merchant Credentials
        </h3>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[250px]">
          <Label htmlFor="name">Merchant Name</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              placeholder="Search by merchant name..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        <div className="w-[180px]">
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

        <div className="w-[180px]">
          <Label htmlFor="environment">Environment</Label>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger
              id="environment"
              className="mt-2 bg-white/50 backdrop-blur-sm"
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