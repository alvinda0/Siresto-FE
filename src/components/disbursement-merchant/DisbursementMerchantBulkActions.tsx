// components/disbursement-merchant/DisbursementMerchantBulkActions.tsx
"use client";

import React from "react";
import { CheckCircle, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DisbursementMerchantBulkActionsProps {
  onBulkApprove?: () => void;
  onBulkReject?: () => void;
  onBulkProcessing?: () => void;
  disabled?: boolean;
}

export const DisbursementMerchantBulkActions: React.FC <
  DisbursementMerchantBulkActionsProps
> = ({
  onBulkApprove,
  onBulkReject,
  onBulkProcessing,
  disabled = false,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-semibold text-gray-900">Bulk Actions</h3>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Bulk Approve Button */}
        <Button
          onClick={onBulkApprove}
          disabled={disabled}
          variant="outline"
          className="h-auto py-3 px-4 flex items-center justify-center gap-2 bg-white/50 hover:bg-green-50/50 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 transition-all"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Bulk Approve</span>
        </Button>

        {/* Bulk Reject Button */}
        <Button
          onClick={onBulkReject}
          disabled={disabled}
          variant="outline"
          className="h-auto py-3 px-4 flex items-center justify-center gap-2 bg-white/50 hover:bg-red-50/50 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-700 transition-all"
        >
          <X className="w-4 h-4" />
          <span className="font-medium text-sm">Bulk Reject</span>
        </Button>

        {/* Bulk Processing Button */}
        <Button
          onClick={onBulkProcessing}
          disabled={disabled}
          variant="outline"
          className="h-auto py-3 px-4 flex items-center justify-center gap-2 bg-white/50 hover:bg-purple-50/50 border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span className="font-medium text-sm">Bulk Processing</span>
        </Button>
      </div>
    </div>
  );
};