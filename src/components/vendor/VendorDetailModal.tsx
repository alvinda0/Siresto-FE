// components/vendor/VendorDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Vendor } from "@/types/vendor";
import { Globe } from "lucide-react";

interface VendorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: Vendor | null;
}

export function VendorDetailModal({
  isOpen,
  onClose,
  vendor,
}: VendorDetailModalProps) {
  if (!vendor) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vendor Detail" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{vendor.name}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Vendor ID: {vendor.vendor_id}
          </p>
        </div>

        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vendor Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {vendor.name}
              </p>
            </div>
          </div>
        </div>

        {/* Endpoint Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Endpoint Information
          </h4>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-600" />
                Production Endpoint URL
              </p>
              <div className="mt-1 p-3 bg-green-50 rounded-lg border border-green-200">
                <a
                  href={vendor.endpoint_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-700 hover:text-green-900 hover:underline break-all"
                >
                  {vendor.endpoint_url}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Globe className="w-4 h-4 text-orange-600" />
                Sandbox Endpoint URL
              </p>
              <div className="mt-1 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <a
                  href={vendor.sandbox_endpoint_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-orange-700 hover:text-orange-900 hover:underline break-all"
                >
                  {vendor.sandbox_endpoint_url}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div>
            <p className="text-sm text-gray-600">Vendor ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {vendor.vendor_id}
            </p>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(vendor.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(vendor.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
