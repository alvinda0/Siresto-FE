// components/disbursement-merchant/ExportDisbursementModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { disbursementMerchantService } from "@/services/disbursement-merchant.service";
import { vendorService } from "@/services/vendor.service";
import { Vendor } from "@/types/vendor";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface ExportDisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "IDR" | "USDT"; // Tambah props type
}

export const ExportDisbursementModal: React.FC<ExportDisbursementModalProps> = ({
  isOpen,
  onClose,
  type, // Terima props type
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Validate dates
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        toast.error("Start date must be before end date");
        return;
      }

      // Build params
      const params: any = {
        type: type, // Gunakan type dari props
      };

      if (vendorId && vendorId !== "all") {
        params.vendor_id = vendorId;
      }

      if (status !== "all") {
        params.status = status;
      }

      if (startDate) {
        params.start_date = startDate;
      }

      if (endDate) {
        params.end_date = endDate;
      }

      toast.info("Exporting data...");

      const blob = await disbursementMerchantService.exportDisbursements(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const statusText = status !== "all" ? `_${status}` : "";
      link.download = `disbursement-merchant-${type.toLowerCase()}${statusText}_${timestamp}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully");
      onClose();

      // Reset form
      setStatus("all");
      setStartDate("");
      setEndDate("");
      setVendorId("all");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    if (!isExporting) {
      setStatus("all");
      setStartDate("");
      setEndDate("");
      setVendorId("all");
      onClose();
    }
  };

  // Fetch vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await vendorService.getVendorsForSelect();
        setVendors(response || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setLoadingVendors(false);
      }
    };

    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-green-500 to-emerald-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Export Disbursement Data</h3>
                <p className="text-green-50 text-sm mt-1">
                  Export {type} disbursement data to Excel
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isExporting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-white">
          {/* Vendor Filter */}
          <div>
            <Label
              htmlFor="export-vendor"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Vendor
            </Label>
            <Select
              value={vendorId}
              onValueChange={setVendorId}
              disabled={isExporting || loadingVendors}
            >
              <SelectTrigger
                id="export-vendor"
                className="w-full h-11 border-2 border-gray-200 focus:border-green-500"
              >
                <SelectValue placeholder={loadingVendors ? "Loading vendors..." : "All Vendors"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label
              htmlFor="export-status"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Status
            </Label>
            <Select
              value={status}
              onValueChange={setStatus}
              disabled={isExporting}
            >
              <SelectTrigger
                id="export-status"
                className="w-full h-11 border-2 border-gray-200 focus:border-green-500"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="start-date"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isExporting}
                className="w-full h-11 border-2 border-gray-200 focus:border-green-500"
              />
            </div>

            <div>
              <Label
                htmlFor="end-date"
                className="text-sm font-semibold text-gray-700 mb-2 block"
              >
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isExporting}
                className="w-full h-11 border-2 border-gray-200 focus:border-green-500"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong className="font-semibold">Note:</strong> Leaving date
              fields empty will export all data. The export will include all
              disbursement details based on your selected filters.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={isExporting}
            className="px-6 h-11 border-2 border-gray-300 hover:bg-gray-100 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {isExporting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Exporting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};