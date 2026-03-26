// components/theme/SetDefaultThemeModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Theme } from "@/types/theme";

interface SetDefaultThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function SetDefaultThemeModal({
  isOpen,
  onClose,
  theme,
  onConfirm,
  isLoading,
}: SetDefaultThemeModalProps) {
  if (!theme) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Default Theme" size="md">
      <div className="space-y-4">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Set this theme as default?
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              This theme will be applied to all users by default. The current default theme will be changed.
            </p>
          </div>
        </div>

        {/* Theme Info */}
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Theme Name
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {theme.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Primary Color
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                  style={{ backgroundColor: theme.primary_color }}
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {theme.primary_color}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Button Primary
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                  style={{ backgroundColor: theme.button_primary_color }}
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {theme.button_primary_color}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Setting...
              </>
            ) : (
              "Set as Default"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}