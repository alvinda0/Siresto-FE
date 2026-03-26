// components/fee/FeeDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Fee } from "@/types/fee";

interface FeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: Fee | null;
}

export function FeeDetailModal({
  isOpen,
  onClose,
  fee,
}: FeeDetailModalProps) {
  if (!fee) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "INACTIVE":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Details" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {fee.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Agent ID: {fee.agent_id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                fee.status
              )}`}
            >
              {fee.status}
            </span>
          </div>
        </div>

        {/* Agent Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Agent Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {fee.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {fee.agent_id}
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
                {fee.platform_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {fee.platform_id}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Fee Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Agent Fee</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {fee.agent_fee}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform Fee</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {fee.platform_fee}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fee</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {fee.total_fee}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}