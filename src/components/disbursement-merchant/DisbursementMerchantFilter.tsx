// components/disbursement-merchant/DisbursementMerchantFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, X, ChevronDown, Download } from "lucide-react";
import { DisbursementMerchantQueryParams } from "@/types/disbursement-merchant";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { merchantService } from "@/services/merchant.service";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { ExportDisbursementModal } from "./ExportDisbursementModal";
import { SelectInput } from "@/components/SelectInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DisbursementMerchantFilterProps {
  onApplyFilters: (filters: DisbursementMerchantQueryParams) => void;
  onExport: () => void;
}

export const DisbursementMerchantFilter: React.FC<
  DisbursementMerchantFilterProps
> = ({ onApplyFilters, onExport }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [merchantId, setMerchantId] = useState<string>("all");
  const [vendorId, setVendorId] = useState<string>("all");
  const [channel, setChannel] = useState<string>("all");

  // Dropdown data
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch merchants for dropdown
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoadingMerchants(true);
        const response = await merchantService.getMerchants({
          page: 1,
          limit: 1000,
        });
        setMerchants(response.data || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await vendorService.getVendorsForSelect();
        setVendors(response || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchMerchants();
    fetchVendors();
  }, []);

  const applyFilters = () => {
    const filters: DisbursementMerchantQueryParams = {
      page: 1,
      limit: 10,
      type: "IDR", // Filter khusus untuk IDR
    };

    if (search.trim()) filters.search = search.trim();
    if (status !== "all") filters.status = status;
    if (merchantId !== "all") filters.merchant_id = merchantId;
    if (vendorId !== "all") filters.vendor_id = vendorId;
    if (channel !== "all") filters.channel = channel;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setMerchantId("all");
    setVendorId("all");
    setChannel("all");
    // Apply default filters to reload all data - reset to initial state
    const defaultFilters: DisbursementMerchantQueryParams = {
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
              placeholder="Search by merchant name or account..."
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

        {/* Channel */}
        <div className="w-40">
          <Label htmlFor="channel" className="text-sm font-medium">
            Channel
          </Label>
          <Select value={channel} onValueChange={setChannel}>
            <SelectTrigger
              id="channel"
              className="mt-1.5 bg-white/50 backdrop-blur-sm"
            >
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="api">API</SelectItem>
              <SelectItem value="script">Script</SelectItem>
              <SelectItem value="website">Website</SelectItem>
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
          {/* Merchant */}
          <div className="w-[200px]">
            <Label htmlFor="merchant" className="text-sm font-medium">
              Merchant
            </Label>
            <div className="mt-1.5">
              <SelectInput
                data={[{ merchant_id: "all", name: "All Merchants" }, ...merchants]}
                value={merchantId}
                onChange={setMerchantId}
                valueKey="merchant_id"
                labelKey="name"
                placeholder={loadingMerchants ? "Loading..." : "All Merchants"}
                disabled={loadingMerchants}
                className="bg-white/50 backdrop-blur-sm"
                searchPlaceholder="Search merchants..."
                emptyText="No merchants found."
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
                data={[{ vendor_id: "all", name: "All Vendors" }, ...vendors]}
                value={vendorId}
                onChange={setVendorId}
                valueKey="vendor_id"
                labelKey="name"
                placeholder={loadingVendors ? "Loading..." : "All Vendors"}
                disabled={loadingVendors}
                className="bg-white/50 backdrop-blur-sm"
                searchPlaceholder="Search vendors..."
                emptyText="No vendors found."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
