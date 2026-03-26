// components/user/DeleteUserModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { User } from "@/types/user";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  isDeleting,
}: DeleteUserModalProps) {
  if (!user) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" size="md">
      <div className="space-y-4">
        {/* Warning Box */}
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Are you sure you want to delete this user?
            </p>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">User Details:</p>
          <p className="font-medium text-gray-900 dark:text-white mt-1">
            {user.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Role: {user.role_name}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Deleting...
              </>
            ) : (
              "Delete User"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}