// components/DeleteConfirmationModal.tsx
import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you absolutely sure?",
  description,
  itemName,
  isDeleting = false,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  const defaultDescription = itemName
    ? `This action cannot be undone. This will permanently delete ${itemName}.`
    : "This action cannot be undone. This will permanently delete this item.";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            {variant === "danger" ? (
              <Trash2 className="w-6 h-6 text-red-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>

          <AlertDialogTitle className="text-center text-xl">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            {description || defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isDeleting} className="w-full sm:w-auto">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className={`w-full sm:w-auto ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Deleting...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                {confirmText}
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
