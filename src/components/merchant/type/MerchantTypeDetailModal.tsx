// components/merchant/type/MerchantTypeDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { MerchantType } from "@/types/merchant-type";
import { formatCurrency } from "@/lib/utils";

interface MerchantTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantType: MerchantType | null;
}

export function MerchantTypeDetailModal({
  isOpen,
  onClose,
  merchantType,
}: MerchantTypeDetailModalProps) {
  if (!merchantType) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Merchant Type Details"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {merchantType.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 font-mono">
            {merchantType.slug}
          </p>
        </div>

        {/* Transaction Limits */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Transaction Limits
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Minimum Amount</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatCurrency(merchantType.minimum)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Maximum Amount</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatCurrency(merchantType.maximum)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Transaction Range</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatCurrency(merchantType.minimum)} -{" "}
                {formatCurrency(merchantType.maximum)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Range:{" "}
                {formatCurrency(merchantType.maximum - merchantType.minimum)}
              </p>
            </div>
          </div>
        </div>

        {/* Type Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Type Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Type Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchantType.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Slug</p>
              <p className="text-base font-medium text-gray-900 mt-1 font-mono">
                {merchantType.slug}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(merchantType.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(merchantType.updated_at)}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div>
            <p className="text-sm text-gray-600">Merchant Type ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {merchantType.merchant_type_id}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}