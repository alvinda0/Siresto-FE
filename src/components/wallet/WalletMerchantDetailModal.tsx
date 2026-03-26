// components/wallet/WalletMerchantDetailModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { WalletMerchant } from "@/types/wallet-merchant";

interface WalletMerchantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletMerchant: WalletMerchant | null;
}

export function WalletMerchantDetailModal({
  isOpen,
  onClose,
  walletMerchant,
}: WalletMerchantDetailModalProps) {
  if (!walletMerchant) return null;

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
    return walletMerchant.pending_balance + walletMerchant.available_balance;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Wallet Merchant Details"
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Header Section */}
        <div className="pb-4 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {walletMerchant.merchant_name}
              </h3>
              <p className="text-sm text-gray-500 mt-1 font-mono">
                {walletMerchant.wallet_id}
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
                {formatCurrency(walletMerchant.available_balance)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Balance</p>
              <p className="text-xl font-bold text-yellow-600 mt-1">
                {formatCurrency(walletMerchant.pending_balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Merchant Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {walletMerchant.merchant_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Agent Name</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {walletMerchant.agent_name}
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
              {walletMerchant.wallet_id}
            </p>
          </div>
        </div>

        {/* Timeline Information */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(walletMerchant.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated At</p>
              <p className="text-base font-medium text-gray-900 mt-1">
                {formatDate(walletMerchant.updated_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
