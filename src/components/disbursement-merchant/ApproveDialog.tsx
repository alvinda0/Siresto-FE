// components/disbursement-merchant/ApproveDialog.tsx
"use client";

import React, { useState, useRef } from "react";
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
import { CheckCircle, Upload, X, FileImage } from "lucide-react";
import PinInputDialog from "@/components/PinInputDialog";
import { toast } from "sonner";

interface ApproveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (formData: FormData) => void;
  disbursementId: string;
  merchantName: string;
  isLoading?: boolean;
}

export const ApproveDialog: React.FC<ApproveDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  disbursementId,
  merchantName,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("File must be an image");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast.error("Reason is required");
      return;
    }

    if (!imageFile) {
      toast.error("Proof image is required");
      return;
    }

    setShowPinDialog(true);
  };

  const handlePinConfirm = (pin: string) => {
    const formData = new FormData();
    formData.append("reason", reason);
    formData.append("image", imageFile!);
    formData.append("pin", pin);

    onConfirm(formData);
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      setImageFile(null);
      setImagePreview(null);
      setShowPinDialog(false);
      onClose();
    }
  };

  return (
    <>
      <AlertDialog open={isOpen && !showPinDialog} onOpenChange={handleClose}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-800">
                Approve Disbursement
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600 text-base leading-relaxed">
              You are about to approve disbursement for{" "}
              <span className="font-semibold text-gray-800">
                {merchantName}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter approval reason..."
                className="bg-white/50 backdrop-blur-sm resize-none min-h-[100px]"
                disabled={isLoading}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold">
                Proof Image <span className="text-red-500">*</span>
              </Label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              ) : (
                <div className="relative rounded-lg border border-gray-200 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <FileImage className="w-4 h-4" />
                      <span className="truncate">{imageFile?.name}</span>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleClose}
              disabled={isLoading}
              variant="outline"
              className="bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Continue
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <PinInputDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onConfirm={handlePinConfirm}
        title="Confirm Approval"
        description={`Enter PIN to approve disbursement for ${merchantName}`}
        isLoading={isLoading}
        actionType="confirm"
        actionLabel="Approve"
        loadingLabel="Approving..."
      />
    </>
  );
};
