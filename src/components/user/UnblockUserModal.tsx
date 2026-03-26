// components/user/UnblockUserModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { User } from "@/types/user";

interface UnblockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => Promise<void>;
  isUnblocking: boolean;
}

export function UnblockUserModal({
  isOpen,
  onClose,
  user,
  onConfirm,
  isUnblocking,
}: UnblockUserModalProps) {
  if (!user) return null;

  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Unblock User" size="md">
      <div className="space-y-4">
        {/* Info Box */}
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <RotateCcw className="w-6 h-6 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Are you sure you want to unblock this user?
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              This will restore the user's access to the system.
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
            disabled={isUnblocking}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isUnblocking}
          >
            {isUnblocking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Unblocking...
              </>
            ) : (
              "Unblock User"
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}