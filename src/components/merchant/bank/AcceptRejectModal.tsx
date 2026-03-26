// components/merchant/AcceptRejectModal.tsx
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { BankMerchant } from "@/types/bank-merchant";

interface AcceptRejectModalProps {
  isOpen: boolean;
  type: "accept" | "reject" | null;
  merchant: BankMerchant | null;
  reason: string;
  isLoading: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const AcceptRejectModal: React.FC<AcceptRejectModalProps> = ({
  isOpen,
  type,
  merchant,
  reason,
  isLoading,
  onReasonChange,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !merchant || !type) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`p-3 rounded-full ${
              type === "accept" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {type === "accept" ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {type === "accept" ? "Accept" : "Reject"} Bank Merchant
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {merchant.merchant_name} - {merchant.account_number}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason{" "}
            {type === "reject" && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder={`Enter reason for ${
              type === "accept" ? "accepting" : "rejecting"
            } this merchant...`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Please provide a clear reason for this action
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !reason.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              type === "accept"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : type === "accept" ? (
              "Accept"
            ) : (
              "Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
