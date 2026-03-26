// components/script/EditEngineModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { FileJson, Loader2, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface KeyValuePair {
  id: string;
  key: string;
  value: string;
}

interface EditEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  engineSettings: EngineSettings | null;
}

export const EditEngineModal: React.FC<EditEngineModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
  engineSettings,
}) => {
  const [pairs, setPairs] = useState<KeyValuePair[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Convert data object → key-value pairs on open
  useEffect(() => {
    if (open && engineSettings) {
      const entries = Object.entries(engineSettings.data || {});
      if (entries.length > 0) {
        setPairs(
          entries.map(([key, value]) => ({
            id: crypto.randomUUID(),
            key,
            value: String(value),
          })),
        );
      } else {
        // Default one empty row
        setPairs([{ id: crypto.randomUUID(), key: "", value: "" }]);
      }
    }
  }, [open, engineSettings]);

  const handleAddRow = () => {
    setPairs((prev) => [
      ...prev,
      { id: crypto.randomUUID(), key: "", value: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    if (pairs.length === 1) return; // keep minimum 1 row
    setPairs((prev) => prev.filter((p) => p.id !== id));
  };

  const handleChange = (
    id: string,
    field: "key" | "value",
    newValue: string,
  ) => {
    setPairs((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: newValue } : p)),
    );
  };

  // Check for duplicate keys
  const hasDuplicateKeys = () => {
    const keys = pairs.map((p) => p.key.trim()).filter(Boolean);
    return keys.length !== new Set(keys).size;
  };

  const hasEmptyKeys = pairs.some((p) => p.key.trim() === "");

  const isFormValid = pairs.length > 0;

  const handleSubmit = async () => {
    if (!engineSettings || !isFormValid) return;

    // Convert pairs → object
    const dataObject = pairs.reduce<Record<string, string>>((acc, pair) => {
      acc[pair.key.trim()] = pair.value;
      return acc;
    }, {});

    try {
      setIsSubmitting(true);
      await scriptService.editEngineData(engineSettings.id, {
        data: dataObject,
      });
      toast.success("Engine data updated successfully");
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-145 bg-white/80 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-amber-500 to-orange-600 px-6 py-5">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <FileJson className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg font-semibold">
                Edit Engine Data
              </DialogTitle>
              <DialogDescription className="text-amber-100 text-sm mt-0.5">
                Update the data configuration for this engine settings
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Info Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Engine", value: engineSettings?.engine },
              { label: "Category", value: engineSettings?.category },
              { label: "Code", value: engineSettings?.code },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3 bg-gray-50/80 border border-gray-100 rounded-xl"
              >
                <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-gray-800 capitalize truncate">
                  {item.value || "-"}
                </p>
              </div>
            ))}
          </div>

          {/* Key-Value Editor */}
          <div className="space-y-3">
            {/* Column Labels */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Key
              </Label>
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Value
              </Label>
              <div className="w-10" />
            </div>

            {/* Rows */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {pairs.map((pair) => (
                <div
                  key={pair.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                >
                  {/* Key - Read Only */}
                  <Input
                    value={pair.key}
                    readOnly
                    className="bg-gray-100 text-gray-500 text-sm border-gray-200 cursor-not-allowed select-none"
                  />

                  {/* Value - Editable */}
                  <Input
                    value={pair.value}
                    onChange={(e) =>
                      handleChange(pair.id, "value", e.target.value)
                    }
                    placeholder="Enter value..."
                    className="bg-white/50 backdrop-blur-sm text-sm border-gray-200 focus:border-amber-300"
                  />

                </div>
              ))}
            </div>
          </div>

          {/* Validation Hints */}
          {hasEmptyKeys && (
            <p className="text-xs text-orange-500">
              ⚠ All key fields must be filled
            </p>
          )}
          {hasDuplicateKeys() && (
            <p className="text-xs text-red-500">
              ⚠ Duplicate keys are not allowed
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-white hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 min-w-30"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
