// components/announcement/DeleteAnnouncementModal.tsx
"use client";

import React from "react";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { Announcement } from "@/types/announcement";

interface DeleteAnnouncementModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DeleteAnnouncementModal: React.FC<
  DeleteAnnouncementModalProps
> = ({ isOpen, announcement, onClose, onConfirm, isLoading }) => {
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!announcement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Announcement"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>

        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Are you sure you want to delete this announcement?
            </p>
            <p className="text-xs text-red-700 mt-1">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Title:</span>
            <span className="text-gray-900 font-medium">
              {announcement.title}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Status:</span>
            <span
              className={`font-medium ${
                announcement.status === "ACTIVE"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {announcement.status}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created By:</span>
            <span className="text-gray-900 font-medium">
              {announcement.created_by_name}
            </span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Deleting...
              </span>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
