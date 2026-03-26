// components/platform/BankPlatformActionModal.tsx
"use client";

import React, { useState } from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BankPlatform } from "@/types/bank-platform";
import { AlertCircle, CheckCircle } from "lucide-react";

interface BankPlatformActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: BankPlatform | null;
  type: "accept" | "reject";
  onConfirm: (reason: string) => Promise<void>;
  isLoading: boolean;
}

export function BankPlatformActionModal({
  isOpen,
  onClose,
  platform,
  type,
  onConfirm,
  isLoading,
}: BankPlatformActionModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!platform) return null;

  const isAccept = type === "accept";
  const title = isAccept ? "Accept Bank Platform" : "Reject Bank Platform";
  const actionColor = isAccept ? "green" : "red";
  const Icon = isAccept ? CheckCircle : AlertCircle;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="space-y-4">
        {/* Platform Info */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Account Number
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {platform.account_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Bank Name
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {platform.bank_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Account Name
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {platform.account_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Platform
            </span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {platform.platform_name}
            </span>
          </div>
        </div>

        {/* Warning Message */}
        <div
          className={`flex items-start gap-3 p-4 rounded-lg ${
            isAccept
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <Icon
            className={`w-5 h-5 mt-0.5 shrink-0 ${
              isAccept ? "text-green-600" : "text-red-600"
            }`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                isAccept ? "text-green-900" : "text-red-900"
              } dark:text-white`}
            >
              {isAccept
                ? "Are you sure you want to accept this bank platform?"
                : "Are you sure you want to reject this bank platform?"}
            </p>
            <p
              className={`text-xs mt-1 ${
                isAccept ? "text-green-700" : "text-red-700"
              } dark:text-gray-300`}
            >
              {isAccept
                ? "This will activate the bank account for transactions."
                : "This will prevent the bank account from being used."}
            </p>
          </div>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-gray-900 dark:text-white">
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Enter reason for ${type}ing this bank platform...`}
            rows={4}
            className="resize-none bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !reason.trim()}
            className={`flex-1 ${
              isAccept
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Processing..." : isAccept ? "Accept" : "Reject"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}