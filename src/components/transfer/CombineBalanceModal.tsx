"use client";

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { X } from "lucide-react";

interface CombineBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (twoFaCode: string) => Promise<void>;
  merchantName: string;
  vendorName: string;
  vendorBalance: number | null;
  loading?: boolean;
}

export const CombineBalanceModal: React.FC<CombineBalanceModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  merchantName,
  vendorName,
  vendorBalance,
  loading = false,
}) => {
  const [twoFaCode, setTwoFaCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...twoFaCode];
    newCode[index] = value;
    setTwoFaCode(newCode);
    setError("");

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !twoFaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    
    if (pastedData) {
      const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
      setTwoFaCode(newCode);
      setError("");
      
      // Focus last filled input or last input
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = twoFaCode.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setError("");
    await onConfirm(code);
  };

  const handleClose = () => {
    setTwoFaCode(["", "", "", "", "", ""]);
    setError("");
    onClose();
  };

  const isComplete = twoFaCode.every(digit => digit !== "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-white">Combine Balance</h3>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">From:</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate ml-2">{vendorName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-600">To:</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate ml-2">{merchantName}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-blue-200">
              <span className="text-xs sm:text-sm text-gray-600">Amount:</span>
              <span className="text-base sm:text-lg font-bold text-green-600">
                {vendorBalance !== null 
                  ? `Rp ${vendorBalance.toLocaleString("id-ID")}`
                  : "null"
                }
              </span>
            </div>
          </div>

          {/* 2FA Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 text-center">
              Enter 2FA Code <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-1.5 sm:gap-2">
              {twoFaCode.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>
            {error && (
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-red-600 text-center">{error}</p>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
            <p className="text-xs text-yellow-800 leading-relaxed">
              ⚠️ This action will transfer all available balance from {vendorName} to {merchantName} wallet.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm sm:text-base transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isComplete}
              className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm sm:text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Confirm Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
