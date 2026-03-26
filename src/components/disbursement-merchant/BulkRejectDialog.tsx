// components/disbursement-merchant/BulkRejectDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, AlertTriangle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SelectInput } from "@/components/SelectInput";
import { disbursementMerchantService } from "@/services/disbursement-merchant.service";
import { vendorService } from "@/services/vendor.service";
import { DisbursementMerchant } from "@/types/disbursement-merchant";
import { Vendor } from "@/types/vendor";
import { getErrorMessage, formatCurrency } from "@/lib/utils";

interface BulkRejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (disbursementIds: string[], reason: string) => Promise<void>;
  isLoading?: boolean;
  type: "IDR" | "USDT";
}

export const BulkRejectDialog: React.FC<BulkRejectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  type,
}) => {
  const [reason, setReason] = useState("");
  const [disbursements, setDisbursements] = useState<DisbursementMerchant[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPending, setShowPending] = useState(true);
  const [showProcessing, setShowProcessing] = useState(true);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelectedIds([]);
      setSearchQuery("");
      setShowPending(true);
      setShowProcessing(true);
      setSelectedVendorId("");
      fetchVendors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchDisbursements();
    }
  }, [isOpen, type, selectedVendorId]);

  const fetchDisbursements = async () => {
    try {
      setLoading(true);

      // Build query params
      const baseParams: any = {
        page: 1,
        limit: 100,
        type: type,
      };

      // Add vendor_id filter if selected
      if (selectedVendorId) {
        baseParams.vendor_id = selectedVendorId;
      }

      // Fetch disbursements with PENDING status
      const pendingResponse =
        await disbursementMerchantService.getDisbursementMerchants({
          ...baseParams,
          status: "PENDING",
        });

      // Fetch disbursements with PROCESSING status
      const processingResponse =
        await disbursementMerchantService.getDisbursementMerchants({
          ...baseParams,
          status: "PROCESSING",
        });

      // Combine both results
      const pendingData = Array.isArray(pendingResponse.data)
        ? pendingResponse.data
        : [];
      const processingData = Array.isArray(processingResponse.data)
        ? processingResponse.data
        : [];

      setDisbursements([...pendingData, ...processingData]);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setDisbursements([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const vendorList = await vendorService.getVendorsForSelect();
      setVendors(vendorList);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setVendors([]);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = filteredDisbursements.map((d) => d.disbursement_id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one disbursement");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    await onConfirm(selectedIds, reason.trim());
  };

  const filteredDisbursements = disbursements.filter((d) => {
    const matchesSearch =
      d.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.disbursement_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.account_number.includes(searchQuery);

    const matchesStatus =
      (showPending && d.status === "PENDING") ||
      (showProcessing && d.status === "PROCESSING");

    return matchesSearch && matchesStatus;
  });

  const isAllSelected =
    filteredDisbursements.length > 0 &&
    selectedIds.length === filteredDisbursements.length;

  const pendingCount = disbursements.filter(
    (d) => d.status === "PENDING",
  ).length;
  const processingCount = disbursements.filter(
    (d) => d.status === "PROCESSING",
  ).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-gray-800">
                Bulk Reject Disbursements
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Select disbursements to reject.{" "}
                <span className="text-red-600 font-semibold">
                  This action cannot be undone.
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Search and Vendor Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by merchant name, ID, or account number..."
                className="pl-10 bg-white/50 backdrop-blur-sm border-gray-300"
                disabled={loading || isLoading}
              />
            </div>
            <div className="md:col-span-1">
              <SelectInput
                data={[{ vendor_id: "", name: "All Vendors" }, ...vendors]}
                value={selectedVendorId}
                onChange={setSelectedVendorId}
                valueKey="vendor_id"
                labelKey="name"
                placeholder="Filter by vendor"
                searchPlaceholder="Search vendor..."
                emptyText="No vendors found"
                disabled={loading || isLoading}
                className="bg-white/50 backdrop-blur-sm border-gray-300"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">
              Filter Status:
            </span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="filter-pending"
                  checked={showPending}
                  onCheckedChange={(checked) =>
                    setShowPending(checked === true)
                  }
                  disabled={loading || isLoading}
                  className="border-gray-400"
                />
                <span className="text-sm text-gray-700">
                  Pending ({pendingCount})
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  id="filter-processing"
                  checked={showProcessing}
                  onCheckedChange={(checked) =>
                    setShowProcessing(checked === true)
                  }
                  disabled={loading || isLoading}
                  className="border-gray-400"
                />
                <span className="text-sm text-gray-700">
                  Processing ({processingCount})
                </span>
              </label>
            </div>
          </div>

          {/* Select All Header */}
          <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="flex items-center gap-2.5">
              <Checkbox
                id="select-all"
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                disabled={
                  loading || isLoading || filteredDisbursements.length === 0
                }
                className="border-gray-400"
              />
              <Label
                htmlFor="select-all"
                className="text-sm font-semibold text-gray-700 cursor-pointer"
              >
                Select All ({selectedIds.length} selected)
              </Label>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {filteredDisbursements.length} disbursements
            </span>
          </div>

          {/* Disbursement List */}
          <div className="max-h-[280px] overflow-y-auto space-y-2 p-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredDisbursements.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-600">
                  No disbursements found
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              filteredDisbursements.map((disbursement) => (
                <label
                  key={disbursement.disbursement_id}
                  htmlFor={`disbursement-${disbursement.disbursement_id}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedIds.includes(disbursement.disbursement_id)
                      ? "bg-red-50/50 border-red-300 hover:bg-red-50"
                      : "bg-white/50 border-gray-200 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  <Checkbox
                    id={`disbursement-${disbursement.disbursement_id}`}
                    checked={selectedIds.includes(disbursement.disbursement_id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(
                        disbursement.disbursement_id,
                        checked as boolean,
                      )
                    }
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        {disbursement.merchant_name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          disbursement.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : disbursement.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {disbursement.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mb-2 truncate">
                      {disbursement.disbursement_id}
                    </p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600">
                        {disbursement.bank_name}
                      </span>
                      <span className="text-gray-600">
                        {disbursement.account_number}
                      </span>
                      <span className="font-bold text-green-700 ml-auto">
                        {formatCurrency(disbursement.total_disbursements)}
                      </span>
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label
              htmlFor="reason"
              className="text-sm font-semibold text-gray-700"
            >
              Rejection Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for bulk rejection..."
              className="min-h-[90px] bg-white/50 backdrop-blur-sm resize-none border-gray-300"
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300 font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || selectedIds.length === 0 || !reason.trim()}
            className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Rejecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <X className="w-4 h-4" />
                <span>Reject ({selectedIds.length})</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
