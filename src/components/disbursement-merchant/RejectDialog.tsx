// components/disbursement-merchant/RejectDialog.tsx
"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface RejectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  disbursementId: string;
  merchantName: string;
  isLoading?: boolean;
}

export const RejectDialog: React.FC<RejectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  disbursementId,
  merchantName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-800">
              Reject Disbursement
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 text-base leading-relaxed">
            You are about to reject disbursement for{" "}
            <span className="font-semibold text-red-700">
              {merchantName}
            </span>
            <br />
            <span className="text-red-600 font-semibold text-sm">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4 space-y-2">
          <Label htmlFor="reject-reason" className="text-sm font-semibold">
            Rejection Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a detailed reason for rejection..."
            className="bg-white/50 backdrop-blur-sm resize-none min-h-[120px] focus:border-red-300 focus:ring-red-200"
            disabled={isLoading}
            maxLength={500}
          />
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
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Rejecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Reject Disbursement</span>
              </div>
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};