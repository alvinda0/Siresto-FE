// components/merchant/MerchantDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Merchant } from "@/types/merchant";

interface MerchantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant | null;
}

export function MerchantDetailModal({
  isOpen,
  onClose,
  merchant,
}: MerchantDetailModalProps) {
  if (!merchant) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

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

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case "LIVE":
        return "bg-blue-100 text-blue-700";
      case "DEVELOPMENT":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Merchant Details" size="xl">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {merchant.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {merchant.vendor_name}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <span
                className={`px-3 py-1 text-center rounded-lg text-sm font-medium uppercase ${getStatusColor(
                  merchant.status
                )}`}
              >
                {merchant.status}
              </span>
              <span
                className={`px-3 py-1 text-center rounded-lg text-sm font-medium uppercase ${getEnvironmentColor(
                  merchant.environment
                )}`}
              >
                {merchant.environment}
              </span>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Merchant Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchant.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Merchant Type</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchant.merchant_type_name}
              </p>
            </div>
            {merchant.external_id && (
              <div>
                <p className="text-sm text-gray-600">External ID</p>
                <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                  {merchant.external_id}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Environment</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchant.environment}
              </p>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Vendor Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vendor Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchant.vendor_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendor ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {merchant.vendor_id}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Agent Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Agent Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {merchant.agent_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {merchant.agent_id}
              </p>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            System Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Merchant ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {merchant.merchant_id}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Merchant Type ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {merchant.merchant_type_id}
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
                {formatDate(merchant.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(merchant.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
