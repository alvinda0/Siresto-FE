// components/announcement/EditAnnouncementModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Edit2 } from "lucide-react";
import { Announcement, UpdateAnnouncementPayload } from "@/types/announcement";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface EditAnnouncementModalProps {
  isOpen: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSubmit: (
    announcementId: string,
    payload: UpdateAnnouncementPayload
  ) => Promise<void>;
  isLoading: boolean;
}

export const EditAnnouncementModal: React.FC<EditAnnouncementModalProps> = ({
  isOpen,
  announcement,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [form, setForm] = useState<UpdateAnnouncementPayload>({
    title: "",
    content: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (announcement) {
      setForm({
        title: announcement.title || "",
        content: announcement.content || "",
        status: announcement.status || "ACTIVE",
      });
      setError(null);
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!announcement) {
      setError("Announcement data is missing");
      return;
    }

    if (!form.title?.trim() || !form.content?.trim()) {
      setError("Title and content are required");
      return;
    }

    setError(null);

    try {
      await onSubmit(announcement.announcement_id, {
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
      });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  if (!announcement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Announcement"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Edit2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Editing: {announcement.title}
            </p>
            <p className="text-xs text-blue-700">
              Last updated:{" "}
              {new Date(announcement.updated_at).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="edit-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter announcement title"
            required
            disabled={isLoading}
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-content">
            Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="edit-content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="Enter announcement content"
            rows={5}
            required
            disabled={isLoading}
            className="bg-white resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.status}
            onValueChange={(value: "ACTIVE" | "INACTIVE") =>
              setForm({ ...form, status: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="edit-status" className="bg-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
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
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};