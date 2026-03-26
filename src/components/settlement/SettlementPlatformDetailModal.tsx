// components/settlement/SettlementPlatformDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { SettlementPlatform } from "@/types/settlement-platform";

interface SettlementPlatformDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: SettlementPlatform | null;
}

export function SettlementPlatformDetailModal({
  isOpen,
  onClose,
  settlement,
}: SettlementPlatformDetailModalProps) {
  if (!settlement) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Platform Settlement Detail"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {settlement.reference}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Settlement ID: {settlement.settlement_id}
          </p>
        </div>

        {/* Settlement Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Settlement Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Reference</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {settlement.reference}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(settlement.amount)}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Settlement ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {settlement.settlement_id}
              </p>
            </div>
          </div>
        </div>

        {/* Platform Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Platform Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {settlement.platform_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {settlement.platform_id}
              </p>
            </div>
          </div>
        </div>

        {/* Settlement User */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Settlement User
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Settled By</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {settlement.settle_by_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">User ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {settlement.settle_by}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(settlement.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(settlement.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}