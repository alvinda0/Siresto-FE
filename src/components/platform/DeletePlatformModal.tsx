"use client";

import { Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";

interface DeletePlatformModalProps {
  isOpen: boolean;
  platformName: string | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeletePlatformModal = ({
  isOpen,
  platformName,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePlatformModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Platform"
      size="md"
      showCloseButton={!isDeleting}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
        <Trash2 className="w-6 h-6 text-red-600" />
      </div>

      {/* Content */}
      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {platformName}
          </span>
          ?
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
          This action cannot be undone.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="
            flex-1 px-4 py-2.5
            text-gray-700 dark:text-gray-300 
            font-medium 
            border border-gray-300 dark:border-gray-600
            rounded-lg 
            hover:bg-gray-50 dark:hover:bg-gray-800
            transition-colors
            disabled:opacity-50 
            disabled:cursor-not-allowed
          "
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isDeleting}
          className="
            flex-1 px-4 py-2.5
            bg-gradient-to-r from-red-600 to-red-700
            hover:from-red-700 hover:to-red-800
            text-white 
            font-medium 
            rounded-lg 
            transition-all
            disabled:opacity-50 
            disabled:cursor-not-allowed 
            flex items-center justify-center gap-2
            shadow-lg shadow-red-500/30
          "
        >
          {isDeleting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};