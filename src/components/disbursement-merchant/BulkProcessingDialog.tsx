// components/disbursement-merchant/BulkProcessingDialog.tsx
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Zap, Info, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SelectInput } from "@/components/SelectInput";
import { disbursementMerchantService } from "@/services/disbursement-merchant.service";
import { vendorService } from "@/services/vendor.service";
import { DisbursementMerchant } from "@/types/disbursement-merchant";
import { Vendor } from "@/types/vendor";
import { getErrorMessage } from "@/lib/utils";

interface BulkProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (disbursementIds: string[]) => Promise<void>;
  isLoading?: boolean;
  type: "IDR" | "USDT";
}

export const BulkProcessingDialog: React.FC<BulkProcessingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  type,
}) => {
  const [disbursements, setDisbursements] = useState<DisbursementMerchant[]>(
    []
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
      setSearchQuery("");
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
      const params: any = {
        page: 1,
        limit: 100,
        type: type,
        status: "PENDING",
      };

      // Add vendor_id filter if selected
      if (selectedVendorId) {
        params.vendor_id = selectedVendorId;
      }

      const response =
        await disbursementMerchantService.getDisbursementMerchants(params);
      setDisbursements(Array.isArray(response.data) ? response.data : []);
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

    await onConfirm(selectedIds);
  };

  const filteredDisbursements = disbursements.filter(
    (d) =>
      d.merchant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.disbursement_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.account_number.includes(searchQuery)
  );

  const isAllSelected =
    filteredDisbursements.length > 0 &&
    selectedIds.length === filteredDisbursements.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Bulk Move to Processing
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-600">
            Select disbursements to move to processing status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1 min-h-0">
          {/* Info Banner */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-sm text-blue-800">
              Only disbursements with <strong>PENDING</strong> status are shown
              and can be moved to processing.
            </p>
          </div>

          {/* Search and Vendor Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by merchant name, ID, or account number..."
                className="pl-10 bg-white/50 backdrop-blur-sm"
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

          {/* Disbursement List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={
                    loading || isLoading || filteredDisbursements.length === 0
                  }
                />
                <Label className="text-sm font-semibold cursor-pointer">
                  Select All ({selectedIds.length} selected)
                </Label>
              </div>
              <span className="text-xs text-gray-500">
                {filteredDisbursements.length} disbursements
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredDisbursements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending disbursements found
                </div>
              ) : (
                filteredDisbursements.map((disbursement) => (
                  <div
                    key={disbursement.disbursement_id}
                    className="flex items-start gap-3 p-3 bg-white/50 hover:bg-white/80 rounded-lg border border-gray-200 transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.includes(
                        disbursement.disbursement_id
                      )}
                      onCheckedChange={(checked) =>
                        handleSelectOne(
                          disbursement.disbursement_id,
                          checked as boolean
                        )
                      }
                      disabled={isLoading}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {disbursement.merchant_name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                          {disbursement.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        ID: {disbursement.disbursement_id}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {disbursement.bank_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {disbursement.account_number}
                        </span>
                        <span className="text-xs font-semibold text-green-700">
                          Rp{" "}
                          {disbursement.total_disbursements.toLocaleString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
            disabled={isLoading || selectedIds.length === 0}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Move to Processing ({selectedIds.length})</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
