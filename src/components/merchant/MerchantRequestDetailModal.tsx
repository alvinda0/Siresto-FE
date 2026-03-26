// components/merchant/MerchantRequestDetailModal.tsx
"use client";

import React from "react";
import { X, Clock, CheckCircle, XCircle, User, Calendar, DollarSign, Hash } from "lucide-react";
import { MerchantRequest } from "@/types/merchantRequest";

interface MerchantRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: MerchantRequest | null;
}

export const MerchantRequestDetailModal: React.FC<MerchantRequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  if (!isOpen || !request) return null;

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      PENDING: "text-yellow-700 bg-yellow-100",
      APPROVED: "text-green-700 bg-green-100",
      REJECTED: "text-red-700 bg-red-100",
    };
    return colors[status] || "text-gray-700 bg-gray-100";
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      PENDING: <Clock className="w-5 h-5" />,
      APPROVED: <CheckCircle className="w-5 h-5" />,
      REJECTED: <XCircle className="w-5 h-5" />,
    };
    return icons[status] || <Clock className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Merchant Request Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {getStatusIcon(request.status)}
              {request.status}
            </span>
          </div>

          {/* Request Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Request Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Request ID</p>
                    <p className="text-sm text-gray-900 font-mono">{request.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Agent</p>
                    <p className="text-sm text-gray-900">{request.agent_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{request.agent_id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Hash className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Requested Count</p>
                    <p className="text-sm text-gray-900">{request.requested_count} merchants</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Estimated Daily Transactions</p>
                    <p className="text-sm text-gray-900">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(request.estimated_daily_transactions)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Timeline
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Created At</p>
                    <p className="text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Updated</p>
                    <p className="text-sm text-gray-900">
                      {new Date(request.updated_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason (if rejected) */}
          {request.reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                {request.status === "REJECTED" ? "Rejection Reason" : "Notes"}
              </h4>
              <p className="text-sm text-red-700">{request.reason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};