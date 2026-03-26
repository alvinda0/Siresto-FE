// components/wallet/WalletPlatformDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { WalletPlatform } from "@/types/wallet-platform";

interface WalletPlatformDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletPlatform | null;
}

export function WalletPlatformDetailModal({
  isOpen,
  onClose,
  wallet,
}: WalletPlatformDetailModalProps) {
  if (!wallet) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBalance = (): number => {
    return wallet.pending_balance + wallet.available_balance;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wallet Platform Details"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {wallet.platform_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-mono">
                {wallet.wallet_id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {formatCurrency(getTotalBalance())}
              </p>
            </div>
          </div>
        </div>

        {/* Balance Information */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Balance Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {formatCurrency(wallet.available_balance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                {formatCurrency(wallet.pending_balance)}
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
                {wallet.platform_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Platform ID</p>
              <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
                {wallet.platform_id}
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
            <p className="text-sm text-gray-600">Wallet ID</p>
            <p className="font-medium text-gray-900 mt-1 font-mono text-xs break-all">
              {wallet.wallet_id}
            </p>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(wallet.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(wallet.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}