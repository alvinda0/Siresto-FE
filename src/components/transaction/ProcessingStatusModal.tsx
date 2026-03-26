// components/transaction/ProcessingStatusModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ProcessingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (status: string, reason: string) => void;
  loading: boolean;
  transactionId: string;
}

export const ProcessingStatusModal: React.FC<ProcessingStatusModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  transactionId,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const statusOptions = [
    { value: "on_going", label: "On Going", color: "text-blue-700" },
    { value: "complete", label: "Complete", color: "text-green-700" },
    { value: "fail", label: "Fail", color: "text-red-700" },
    { value: "manual", label: "Manual", color: "text-orange-700" },
  ];

  // Reset state ketika modal dibuka/ditutup atau transaction berubah
  useEffect(() => {
    if (isOpen) {
      // Reset ketika modal dibuka
      setSelectedStatus("");
      setReason("");
    }
  }, [isOpen, transactionId]);

  const handleSubmit = () => {
    if (!selectedStatus || !reason.trim()) {
      return;
    }
    onSubmit(selectedStatus, reason);
  };

  const handleClose = () => {
    setSelectedStatus("");
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Update Processing Status
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Transaction: {transactionId}
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Processing Status <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 ${
                    selectedStatus === option.value
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-gray-200 bg-white/50 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`text-sm font-bold uppercase ${option.color}`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              placeholder="Enter reason for status change..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Please provide a clear reason for this status change
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedStatus || !reason.trim()}
            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              "Update Status"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};