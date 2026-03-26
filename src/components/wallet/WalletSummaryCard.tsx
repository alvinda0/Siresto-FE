// components/wallet/WalletPlatformSummaryCards.tsx
"use client";

import React from "react";
import { Wallet, TrendingUp, DollarSign } from "lucide-react";
import { WalletPlatformSummary } from "@/types/wallet-platform";

interface WalletSummaryCardsProps {
  summary: WalletPlatformSummary;
}

export function WalletSummaryCards({ summary }: WalletSummaryCardsProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Available Balance Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wallet className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 mb-0.5">Available Balance</p>
            <p className="text-lg font-bold text-green-700 truncate">
              {formatCurrency(summary.total_available_balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Pending Balance Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 mb-0.5">Pending Balance</p>
            <p className="text-lg font-bold text-yellow-700 truncate">
              {formatCurrency(summary.total_pending_balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-600 mb-0.5">Total Balance</p>
            <p className="text-lg font-bold text-blue-700 truncate">
              {formatCurrency(summary.total_balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}