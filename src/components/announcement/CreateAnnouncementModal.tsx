// components/announcement/CreateAnnouncementModal.tsx
"use client";

import React, { useState } from "react";
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
import { AlertCircle, Megaphone } from "lucide-react";
import { CreateAnnouncementPayload } from "@/types/announcement";
import { get } from "http";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => Promise<void>;
  isLoading: boolean;
}

export const CreateAnnouncementModal: React.FC <CreateAnnouncementModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [form, setForm] = useState<CreateAnnouncementPayload>({
    title: "",
    content: "",
    status: "ACTIVE",
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required");
      return;
    }

    setError(null);

    try {
      await onSubmit({
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
      });
      // Reset form on success
      setForm({ title: "", content: "", status: "ACTIVE" });
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setForm({ title: "", content: "", status: "ACTIVE" });
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Announcement"
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
          <Megaphone className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Create a new announcement to notify all users
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
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
          <Label htmlFor="content">
            Content <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="content"
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
          <Label htmlFor="status">
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={form.status}
            onValueChange={(value: "ACTIVE" | "INACTIVE") =>
              setForm({ ...form, status: value })
            }
            disabled={isLoading}
          >
            <SelectTrigger id="status" className="bg-white">
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
                Creating...
              </span>
            ) : (
              "Create Announcement"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
