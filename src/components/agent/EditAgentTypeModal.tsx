// components/agent/EditAgentTypeModal.tsx
import React, { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";
import { AgentType, UpdateAgentTypePayload } from "@/types/agentType";
import { agentTypeService } from "@/services/agentType.service";
import { Modal } from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface EditAgentTypeModalProps {
  isOpen: boolean;
  agentType: AgentType | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  type: string;
  description: string;
}

export const EditAgentTypeModal: React.FC<EditAgentTypeModalProps> = ({
  isOpen,
  agentType,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    type: "",
    description: "",
  });
  const [typeError, setTypeError] = useState("");

  // Reset form when agentType changes
  useEffect(() => {
    if (agentType) {
      setFormData({
        type: agentType.type,
        description: agentType.description || "",
      });
      setTypeError("");
    }
  }, [agentType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "type") {
      setTypeError("");
    }
  };

  const validateForm = (): boolean => {
    if (!formData.type.trim()) {
      setTypeError("Type is required");
      return false;
    }

    if (formData.type.trim().length < 2) {
      setTypeError("Type must be at least 2 characters");
      return false;
    }

    if (formData.type.trim().length > 100) {
      setTypeError("Type must not exceed 100 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !agentType) return;

    try {
      setIsSubmitting(true);

      const payload: UpdateAgentTypePayload = {
        type: formData.type.trim(),
        description: formData.description.trim(),
      };

      await agentTypeService.updateAgentType(
        agentType.agent_type_id,
        payload
      );

      toast.success("Agent type updated successfully!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!agentType) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      showCloseButton={false}
    >
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Edit Agent Type
            </h2>
            <p className="text-sm text-gray-500 mt-1">{agentType.type}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 mb-6">
        {/* Type Input */}
        <div className="space-y-2">
          <Label htmlFor="type" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Type <span className="text-red-500">*</span>
          </Label>
          <Input
            id="type"
            name="type"
            type="text"
            value={formData.type}
            onChange={handleInputChange}
            placeholder="Enter agent type"
            disabled={isSubmitting}
            className={typeError ? "border-red-500" : ""}
          />
          {typeError ? (
            <p className="text-sm text-red-600">{typeError}</p>
          ) : (
            <p className="text-xs text-gray-500">
              {formData.type.length}/100 characters
            </p>
          )}
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="Enter description (optional)"
            disabled={isSubmitting}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-200/50">
        <Button
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              Update
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};