// components/disbursement-merchant/ProcessingDialog.tsx
"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProcessingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  disbursementId: string;
  merchantName: string;
  amount: number;
  isLoading?: boolean;
}

export const ProcessingDialog: React.FC<ProcessingDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  disbursementId,
  merchantName,
  amount,
  isLoading = false,
}) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              Move to Processing
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed">
            You are about to move this disbursement to{" "}
            <span className="font-semibold text-blue-700">
              Processing Status
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          {/* Disbursement Info */}
          <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Merchant
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {merchantName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-medium">
                  Amount
                </span>
                <span className="text-base font-bold text-blue-700">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="text-sm text-gray-600 font-medium">
                  Disbursement ID
                </span>
                <span className="text-xs font-mono text-gray-700 bg-white/70 px-2 py-1 rounded">
                  {disbursementId}
                </span>
              </div>
            </div>
          </div>

          {/* Status Change Indicator */}
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-lg border border-yellow-300">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-xs font-bold text-yellow-700">
                PENDING
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-300">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-xs font-bold text-blue-700">
                PROCESSING
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
            <p className="text-xs text-blue-800 leading-relaxed">
              <span className="font-semibold">Note:</span> This action will
              change the status to Processing. You can still Approve or
              Reject after this step.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            onClick={handleClose}
            disabled={isLoading}
            variant="outline"
            className="bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Move to Processing</span>
              </div>
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};