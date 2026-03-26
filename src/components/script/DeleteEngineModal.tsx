// components/script/DeleteEngineModal.tsx
"use client";

import React, { useState } from "react";
import { Trash2, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EngineSettings } from "@/types/script";
import { scriptService } from "@/services/script.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface DeleteEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  engineSettings: EngineSettings | null;
}

export const DeleteEngineModal: React.FC<DeleteEngineModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  engineSettings,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!engineSettings) return;

    try {
      setIsDeleting(true);
      await scriptService.deleteEngineSettings(engineSettings.id);
      toast.success("Engine settings deleted successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-115 bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-red-500 to-rose-600 px-6 py-5">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-semibold">
                Delete Engine Settings
              </DialogTitle>
              <DialogDescription className="text-red-100 text-sm mt-0.5">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <TriangleAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">
                Are you sure you want to delete this engine settings?
              </p>
              <p className="text-xs text-red-500 mt-1">
                All associated data and configuration will be permanently
                removed.
              </p>
            </div>
          </div>

          {/* Engine Details */}
          <div className="p-4 bg-gray-50/80 border border-gray-100 rounded-xl space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Engine Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "ID", value: engineSettings?.id },
                { label: "Agent", value: engineSettings?.agent_name },
                { label: "Engine", value: engineSettings?.engine },
                { label: "Category", value: engineSettings?.category },
                {
                  label: "Code",
                  value: engineSettings?.code,
                  truncate: true,
                },
                {
                  label: "Status",
                  value: engineSettings?.is_enable ? "Enabled" : "Disabled",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p
                    className={`text-sm font-semibold text-gray-800 capitalize ${
                      item.truncate ? "truncate max-w-36" : ""
                    }`}
                    title={item.truncate ? String(item.value ?? "") : undefined} // ✅ full text on hover
                  >
                    {item.value ?? "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 min-w-30"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
