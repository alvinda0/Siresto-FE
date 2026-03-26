// components/transaction/ResendCallbackModal.tsx
import React from "react";
import { Send, X } from "lucide-react";

interface ResendCallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  transactionId: string;
}

export const ResendCallbackModal: React.FC<ResendCallbackModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  transactionId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              Resend Callback
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-2">
              Are you sure you want to resend the callback for this transaction?
            </p>
            <div className="mt-3 p-3 bg-white/60 rounded-lg border border-gray-200/50">
              <p className="text-xs text-gray-500 mb-1">Transaction ID:</p>
              <p className="text-sm font-mono font-semibold text-gray-800 break-all">
                {transactionId}
              </p>
            </div>
          </div>

          <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-200/50 rounded-xl p-4">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">Note:</span> This action will
              queue the callback to be sent again to the webhook URL.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Resend Callback</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};