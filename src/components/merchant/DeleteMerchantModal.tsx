// components/merchant/DeleteMerchantModal.tsx
import React from "react";
import { X, Trash2 } from "lucide-react";

interface DeleteMerchantModalProps {
  isOpen: boolean;
  merchantName: string | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const DeleteMerchantModal: React.FC<DeleteMerchantModalProps> = ({
  isOpen,
  merchantName,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Delete Merchant</h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {merchantName}
              </span>
              ?
            </p>
            <p className="text-gray-500 text-xs mt-2">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
      </div>
    </div>
  );
};
