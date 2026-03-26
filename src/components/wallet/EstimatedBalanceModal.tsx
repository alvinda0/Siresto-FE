// components/wallet/EstimatedBalanceModal.tsx
"use client";

import React from "react";
import { TrendingUp, Calendar, User } from "lucide-react";
import { Modal } from "../Modal";

interface EstimatedBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  estimatedBalance: number;
  lastUpdated?: string;
}

export const EstimatedBalanceModal: React.FC<EstimatedBalanceModalProps> = ({
  isOpen,
  onClose,
  merchantName,
  estimatedBalance,
  lastUpdated,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Estimated Balance Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90">Estimated Balance</p>
              <h3 className="text-3xl font-bold">
                {formatCurrency(estimatedBalance)}
              </h3>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-4">
          {/* Merchant Name */}
          <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Merchant Name
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {merchantName}
              </p>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                  Last Updated
                </p>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {formatDate(lastUpdated)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Note:</span> Estimated balance is
            calculated based on pending transactions and may differ from actual
            available balance.
          </p>
        </div>
      </div>
    </Modal>
  );
};
