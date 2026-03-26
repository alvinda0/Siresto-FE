// components/platform/bank/BankPlatformDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { BankPlatform } from "@/types/bank-platform";

interface BankPlatformDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankPlatform: BankPlatform | null;
}

export function BankPlatformDetailModal({
  isOpen,
  onClose,
  bankPlatform,
}: BankPlatformDetailModalProps) {
  if (!bankPlatform) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Platform Details"
      size="xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {bankPlatform.account_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {bankPlatform.bank_name}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                bankPlatform.status
              )}`}
            >
              {bankPlatform.status}
            </span>
          </div>
        </div>

        {/* Bank Account Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Bank Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="text-base font-medium text-gray-900 mt-1 font-mono">
                {bankPlatform.account_number}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {bankPlatform.account_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {bankPlatform.bank_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Code</p>
              <p className="text-base font-medium text-gray-900 mt-1 font-mono">
                {bankPlatform.bank_code}
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
                {bankPlatform.platform_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {bankPlatform.platform_id}
              </p>
            </div>
          </div>
        </div>

        {/* Creator Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Creator Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created By</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {bankPlatform.created_by_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Creator ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {bankPlatform.created_by}
              </p>
            </div>
          </div>
        </div>

        {/* Approval Information */}
        {bankPlatform.accepted_by && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Approval Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Approved By</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {bankPlatform.accepted_by_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approver ID</p>
                <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                  {bankPlatform.accepted_by}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reason Section */}
        {bankPlatform.reason && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Reason / Notes
            </h4>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-base text-gray-900 leading-relaxed">
                {bankPlatform.reason}
              </p>
            </div>
          </div>
        )}

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(bankPlatform.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(bankPlatform.updated_at)}
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
            <p className="text-sm text-gray-600">Bank Platform ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {bankPlatform.bank_platform_id}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}