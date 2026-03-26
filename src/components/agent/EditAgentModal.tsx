// components/agent/EditAgentModal.tsx
import React, { useEffect, useState } from "react";
import { X, DollarSign, CheckSquare } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Agent, UpdateAgentPayload } from "@/types/agent";
import { agentService } from "@/services/agent.service";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/utils";

interface EditAgentModalProps {
  isOpen: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  fee: string;
  hide_fee: string;
  admin_fee: string;
  status: string;
  reason: string;
}

export const EditAgentModal: React.FC<EditAgentModalProps> = ({
  isOpen,
  agent,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    fee: "",
    hide_fee: "",
    admin_fee: "",
    status: "ACTIVE",
    reason: "",
  });
  const [feeError, setFeeError] = useState("");
  const [hideFeeError, setHideFeeError] = useState("");

  useEffect(() => {
    if (agent) {
      setFormData({
        fee: agent.fee.toString(),
        hide_fee: agent.hide_fee.toString(),
        admin_fee: agent.admin_fee ? agent.admin_fee.toString() : "0",
        status: agent.status,
        reason: "",
      });
      setFeeError("");
      setHideFeeError("");
    }
  }, [agent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "fee") setFeeError("");
    if (name === "hide_fee") setHideFeeError("");
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const validateFee = (): boolean => {
    const feeValue = parseFloat(formData.fee);
    const hideFeeValue = parseFloat(formData.hide_fee);

    let isValid = true;

    if (!formData.fee || isNaN(feeValue)) {
      setFeeError("Fee must be a valid number");
      isValid = false;
    } else if (feeValue < 0.7) {
      setFeeError("Fee must be at least 0.7%");
      isValid = false;
    } else if (feeValue > 100) {
      setFeeError("Fee cannot exceed 100%");
      isValid = false;
    }

    if (!formData.hide_fee || isNaN(hideFeeValue)) {
      setHideFeeError("Hide fee must be a valid number");
      isValid = false;
    } else if (hideFeeValue < 0) {
      setHideFeeError("Hide fee cannot be negative");
      isValid = false;
    } else if (hideFeeValue > 100) {
      setHideFeeError("Hide fee cannot exceed 100%");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateFee() || !agent) return;

    try {
      setIsSubmitting(true);

      const payload: UpdateAgentPayload = {
        fee: parseFloat(formData.fee),
        hide_fee: parseFloat(formData.hide_fee),
        status: formData.status,
        reason: formData.reason.trim() || null,
      };

      if (formData.admin_fee && formData.admin_fee.trim() !== "") {
        payload.admin_fee = parseFloat(formData.admin_fee);
      }

      await agentService.updateAgent(agent.agent_id, payload);

      toast.success("Agent updated successfully!");

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
    if (!isSubmitting) onClose();
  };

  if (!agent) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" showCloseButton={false}>
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Edit Agent</h2>
            <p className="text-sm text-gray-500 mt-1">{agent.name}</p>
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
        {/* Fee Input */}
        <div className="space-y-2">
          <Label htmlFor="fee" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Fee (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fee"
            name="fee"
            type="number"
            value={formData.fee}
            onChange={handleInputChange}
            placeholder="0.70"
            step="0.1"
            min="0.7"
            max="100"
            disabled={isSubmitting}
            className={feeError ? "border-red-500" : ""}
          />
          {feeError ? (
            <p className="text-sm text-red-600">{feeError}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Current: {agent.fee}% | Min: 0.7% | Max: 100%
            </p>
          )}
        </div>

        {/* Hide Fee Input */}
        <div className="space-y-2">
          <Label htmlFor="hide_fee" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Hide Fee (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="hide_fee"
            name="hide_fee"
            type="number"
            value={formData.hide_fee}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.1"
            min="0"
            max="100"
            disabled={isSubmitting}
            className={hideFeeError ? "border-red-500" : ""}
          />
          {hideFeeError ? (
            <p className="text-sm text-red-600">{hideFeeError}</p>
          ) : (
            <p className="text-xs text-gray-500">
              Current: {agent.hide_fee}% | Min: 0% | Max: 100%
            </p>
          )}
        </div>

        {/* Admin Fee Input */}
        <div className="space-y-2">
          <Label htmlFor="admin_fee" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Admin Fee (Rp){" "}
            <span className="text-gray-400 font-normal text-xs">- Opsional</span>
          </Label>
          <Input
            id="admin_fee"
            name="admin_fee"
            type="number"
            value={formData.admin_fee}
            onChange={handleInputChange}
            placeholder="0"
            step="1"
            min="0"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500">
            Current: Rp {agent.admin_fee ? agent.admin_fee.toLocaleString("id-ID") : "0"}
          </p>
        </div>

        {/* Status Select */}
        <div className="space-y-2">
          <Label htmlFor="status" className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4" />
            Status <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.status}
            onValueChange={handleStatusChange}
            disabled={isSubmitting}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Current: {agent.status}</p>
        </div>

        {/* Reason Textarea */}
        <div className="space-y-2">
          <Label htmlFor="reason">Reason (Optional)</Label>
          <Textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows={3}
            placeholder="Enter reason for update (optional)"
            disabled={isSubmitting}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Provide a reason for this update if necessary
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
            <>Update Agent</>
          )}
        </Button>
      </div>
    </Modal>
  );
};