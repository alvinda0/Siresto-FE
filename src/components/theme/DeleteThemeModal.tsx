// components/theme/DeleteThemeModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Theme } from "@/types/theme";

interface DeleteThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteThemeModal({
  isOpen,
  onClose,
  theme,
  onConfirm,
  isDeleting,
}: DeleteThemeModalProps) {
  if (!theme) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Theme" size="md">
      <div className="space-y-4">
        {/* Warning Box */}
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Are you sure you want to delete this theme?
            </p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              This action cannot be undone. The theme will be permanently removed from the system.
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

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Primary Color
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: theme.primary_color }}
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.primary_color}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Button Primary
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: theme.button_primary_color }}
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.button_primary_color}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Theme"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}