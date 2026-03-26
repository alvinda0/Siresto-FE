// components/settlement/SettlementPlatformActionCard.tsx
"use client";

import React from "react";
import { Plus, Upload, Download, DollarSign, Zap } from "lucide-react";

interface SettlementPlatformActionCardProps {
  onCreateSettlement: () => void;
  onBulkUpload: () => void;
  onDownloadTemplate: () => void;
  onDownloadEstimated: () => void;
  onDownloadPlatformFee: () => void;
  downloadLoading: boolean;
  estimatedLoading: boolean;
  platformFeeLoading: boolean;
}

export function SettlementPlatformActionCard({
  onCreateSettlement,
  onBulkUpload,
  onDownloadTemplate,
  onDownloadEstimated,
  onDownloadPlatformFee,
  downloadLoading,
  estimatedLoading,
  platformFeeLoading,
}: SettlementPlatformActionCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-blue-600" />
        <h2 className="text-sm font-semibold text-gray-800">Actions</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Download Template */}
        <button
          onClick={onDownloadTemplate}
          disabled={downloadLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {downloadLoading ? "Downloading..." : "Download Template"}
          </span>
        </button>

        {/* Bulk Settlement */}
        <button
          onClick={onBulkUpload}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-green-200 hover:border-green-400 hover:bg-green-50/50 rounded-lg transition-all duration-200 group"
        >
          <Upload className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            Bulk Settlement
          </span>
        </button>

        {/* Download Platform Fee */}
        <button
          onClick={onDownloadPlatformFee}
          disabled={platformFeeLoading}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <DollarSign className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">
            {platformFeeLoading ? "Downloading..." : "Platform Fee"}
          </span>
        </button>

        {/* Create Settlement */}
        <button
          onClick={onCreateSettlement}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 text-white" />
          <span className="text-sm font-medium text-white">
            Create Settlement
          </span>
        </button>
      </div>
    </div>
  );
}