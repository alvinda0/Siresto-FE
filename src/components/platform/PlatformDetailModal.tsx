// components/platform/PlatformDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Platform } from "@/types/platform";

interface PlatformDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: Platform | null;
}

export function PlatformDetailModal({
  isOpen,
  onClose,
  platform,
}: PlatformDetailModalProps) {
  if (!platform) return null;

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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Platform Details" size="lg">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Referral Code: {platform.referral}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                platform.status
              )}`}
            >
              {platform.status}
            </span>
          </div>
        </div>

        {/* Platform Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Platform Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {platform.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Referral Code</p>
              <p className="text-base font-medium text-gray-900 mt-1 font-mono">
                {platform.referral}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform Fee</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {platform.fee}%
              </p>
            </div>
          </div>
        </div>

        {/* Partner Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Partner Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Partner Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {platform.partner_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Partner ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {platform.partner_id}
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
            <p className="text-sm text-gray-600">Platform ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {platform.platform_id}
            </p>
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
                {formatDate(platform.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(platform.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}