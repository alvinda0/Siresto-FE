"use client";

import { RefreshCcw, X, AlertTriangle } from "lucide-react";

interface BotRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  transactionId: string;
}

export const BotRetryModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  transactionId,
}: BotRetryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 bg-purple-100 rounded-2xl mx-auto mb-4">
          <RefreshCcw className="w-7 h-7 text-purple-600" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-slate-800 text-center mb-1">
          Confirm Bot Retry
        </h2>
        <p className="text-sm text-slate-500 text-center mb-5">
          Are you sure you want to queue a bot retry for this transaction?
        </p>

        {/* Transaction ID Info */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-slate-400 mb-0.5">Transaction ID</p>
          <p className="text-sm font-mono font-semibold text-slate-700 truncate">
            {transactionId}
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            This action will re-queue the bot processing for the failed
            transaction. Make sure the transaction data is valid before
            retrying.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl border border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25"
          >
            <RefreshCcw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Queuing..." : "Retry Bot"}
          </button>
        </div>
      </div>
    </div>
  );
};