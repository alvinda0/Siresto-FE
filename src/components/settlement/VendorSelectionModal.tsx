// components/settlement/VendorSelectionModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { vendorService } from "@/services/vendor.service";
import { Vendor } from "@/types/vendor";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface VendorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vendorId: string) => void;
  isLoading: boolean;
}

export function VendorSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: VendorSelectionModalProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [loadingVendors, setLoadingVendors] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const vendorList = await vendorService.getVendorsForSelect();
      setVendors(vendorList);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      toast.error("Please select a vendor");
      return;
    }
    onSubmit(selectedVendorId);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedVendorId("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Select Vendor
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="vendor"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Vendor <span className="text-red-500">*</span>
            </label>
            {loadingVendors ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <select
                id="vendor"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.vendor_id} value={vendor.vendor_id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedVendorId}
              className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
