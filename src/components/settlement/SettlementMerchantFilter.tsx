// components/settlement/SettlementMerchantFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SelectInput } from "@/components/SelectInput";
import { Merchant } from "@/types/merchant";
import { Vendor } from "@/types/vendor";
import { merchantService } from "@/services/merchant.service";
import { vendorService } from "@/services/vendor.service";
import { SettlementMerchantQueryParams } from "@/types/settlement-merchant";
import { toast } from "sonner";

interface SettlementMerchantFilterProps {
  onApplyFilters: (filters: SettlementMerchantQueryParams) => void;
}

export const SettlementMerchantFilter: React.FC<
  SettlementMerchantFilterProps
> = ({ onApplyFilters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [merchantId, setMerchantId] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");

  useEffect(() => {
    fetchMerchants();
    fetchVendors();
  }, []);

  const fetchMerchants = async () => {
    try {
      setLoadingMerchants(true);
      const response = await merchantService.getMerchants({
        page: 1,
        limit: 1000,
      });
      setMerchants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch merchants:", error);
      toast.error("Failed to load merchants");
    } finally {
      setLoadingMerchants(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorService.getVendors({
        page: 1,
        limit: 100,
      });
      setVendors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoadingVendors(false);
    }
  };

  const applyFilters = () => {
    const filters: SettlementMerchantQueryParams = {
      page: 1,
      limit: 10,
    };

    if (search.trim()) {
      filters.search = search.trim();
    }
    if (merchantId && merchantId.trim()) {
      filters.merchant_id = merchantId;
    }
    if (vendorId && vendorId.trim()) {
      filters.vendor_id = vendorId;
    }

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setMerchantId("");
    setVendorId("");
    // Reset semua filter dan force reload data
    const clearFilters: SettlementMerchantQueryParams = { 
      page: 1, 
      limit: 10 
    };
    onApplyFilters(clearFilters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
      </div>

      {/* Main Filter Row */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px]">
          <Label htmlFor="search">Search</Label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search by reference, merchant name..."
              className="pl-10 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={applyFilters}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
        >
          Apply
        </Button>

        {/* Advanced Toggle */}
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

        {/* Clear Button */}
        <Button
          onClick={handleClear}
          variant="outline"
          className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700"
        >
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-gray-200">
          {/* Merchant Select */}
          <div className="w-[250px]">
            <Label htmlFor="merchant">Merchant</Label>
            <div className="mt-2">
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
            {loadingMerchants && (
              <p className="text-xs text-gray-500 mt-1">Loading merchants...</p>
            )}
          </div>

          {/* Vendor Select */}
          <div className="w-[250px]">
            <Label htmlFor="vendor">Vendor</Label>
            <div className="mt-2">
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
            {loadingVendors && (
              <p className="text-xs text-gray-500 mt-1">Loading vendors...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
