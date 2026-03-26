// components/settlement/SettlementActionCard.tsx
"use client";

import React from "react";
import { Plus, Upload, Download, FileSpreadsheet } from "lucide-react";

interface SettlementActionCardProps {
  onCreateSettlement: () => void;
  onBulkUpload: () => void;
  onDownloadTemplate: () => void;
  onDownloadEstimated: () => void;
  downloadLoading: boolean;
  estimatedLoading: boolean;
}

export function SettlementActionCard({
  onCreateSettlement,
  onBulkUpload,
  onDownloadTemplate,
  onDownloadEstimated,
  downloadLoading,
  estimatedLoading,
}: SettlementActionCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg p-4">
      <div className="flex flex-wrap items-center justify-end gap-2 lg:gap-3">
        <button
          onClick={onDownloadEstimated}
          disabled={estimatedLoading}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">
            {estimatedLoading ? "Downloading..." : "Download Estimated"}
          </span>
          <span className="sm:hidden">Estimated</span>
        </button>

        <button
          onClick={onDownloadTemplate}
          disabled={downloadLoading}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">
            {downloadLoading ? "Downloading..." : "Download Template"}
          </span>
          <span className="sm:hidden">Template</span>
        </button>

        <button
          onClick={onBulkUpload}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Bulk Settlement</span>
          <span className="sm:hidden">Bulk</span>
        </button>

        <button
          onClick={onCreateSettlement}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Settlement</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>
    </div>
  );
}