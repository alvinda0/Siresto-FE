import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Save,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Building2,
  Users,
} from "lucide-react";
import { Fee, UpdateFeePayload } from "@/types/fee";
import { feeService } from "@/services/fee.service";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

function Modal({ isOpen, onClose, children, size = "md" }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300`}
      >
        {children}
      </div>
    </div>
  );
}

interface EditFeeModalProps {
  isOpen: boolean;
  fee: Fee | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  agent_fee: string;
  platform_fee: string;
}

interface EditFormErrors {
  agent_fee: string;
  platform_fee: string;
}

export const EditFeeModal: React.FC<EditFeeModalProps> = ({
  isOpen,
  fee,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditFormData>({
    agent_fee: "",
    platform_fee: "",
  });

  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    agent_fee: "",
    platform_fee: "",
  });

  // Use refs to store callback functions to avoid dependency issues
  const onCloseRef = useRef(onClose);
  const onSuccessRef = useRef(onSuccess);

  // Update refs when props change
  useEffect(() => {
    onCloseRef.current = onClose;
    onSuccessRef.current = onSuccess;
  }, [onClose, onSuccess]);

  // Update form when fee changes
  useEffect(() => {
    if (fee) {
      setFormData({
        agent_fee: fee.agent_fee?.toString() || "0",
        platform_fee: fee.platform_fee?.toString() || "0",
      });
      setFormErrors({ agent_fee: "", platform_fee: "" });
      setError(null);
      setSuccessMessage(null);
    }
  }, [fee]);

  // Auto close modal on success
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        onSuccessRef.current();
        onCloseRef.current();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const calculateTotalFee = (): number => {
    const agent = parseFloat(formData.agent_fee) || 0;
    const platform = parseFloat(formData.platform_fee) || 0;
    return agent + platform;
  };

  const validateForm = (): boolean => {
    const errors: EditFormErrors = { agent_fee: "", platform_fee: "" };
    let isValid = true;

    // Validate agent_fee
    const agentFeeValue = parseFloat(formData.agent_fee);
    if (!formData.agent_fee || isNaN(agentFeeValue)) {
      errors.agent_fee = "Agent fee must be a valid number";
      isValid = false;
    } else if (agentFeeValue < 0) {
      errors.agent_fee = "Agent fee cannot be negative";
      isValid = false;
    } else if (agentFeeValue > 100) {
      errors.agent_fee = "Agent fee cannot exceed 100%";
      isValid = false;
    }

    // Validate platform_fee
    const platformFeeValue = parseFloat(formData.platform_fee);
    if (!formData.platform_fee || isNaN(platformFeeValue)) {
      errors.platform_fee = "Platform fee must be a valid number";
      isValid = false;
    } else if (platformFeeValue < 0) {
      errors.platform_fee = "Platform fee cannot be negative";
      isValid = false;
    } else if (platformFeeValue > 100) {
      errors.platform_fee = "Platform fee cannot exceed 100%";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !fee) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: UpdateFeePayload = {
        agent_fee: parseFloat(formData.agent_fee),
        platform_fee: parseFloat(formData.platform_fee),
      };

      await feeService.updateFee(fee.agent_id, payload);
      setSuccessMessage("Fee updated successfully!");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
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

  if (!fee) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Edit Fee</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Update fee information for {fee.name}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 px-6 pb-6 max-h-[70vh] overflow-y-auto">
        {/* Agent Information Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold">Agent Name</p>
              <p className="text-sm font-semibold text-gray-800">{fee.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-semibold">Platform</p>
              <p className="text-sm font-semibold text-gray-800">
                {fee.platform_name}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agent Fee */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              Agent Fee (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="agent_fee"
              value={formData.agent_fee}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                formErrors.agent_fee
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
              disabled={isSubmitting}
            />
            {formErrors.agent_fee ? (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.agent_fee}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Current: {fee.agent_fee}%
              </p>
            )}
          </div>

          {/* Platform Fee */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <DollarSign className="w-4 h-4" />
              Platform Fee (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="platform_fee"
              value={formData.platform_fee}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                formErrors.platform_fee
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="0.00"
              step="0.01"
              min="0"
              max="100"
              disabled={isSubmitting}
            />
            {formErrors.platform_fee ? (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.platform_fee}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Current: {fee.platform_fee}%
              </p>
            )}
            {/* Platform Fee Warning */}
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Warning
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Changing the platform fee will update the platform fee for <span className="font-semibold">all agents</span> using the <span className="font-semibold">{fee.platform_name}</span> platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Fee Preview */}
        {formData.agent_fee && formData.platform_fee && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-medium text-purple-900">
              Total Fee Preview
            </p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {calculateTotalFee().toFixed(2)}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Update Fee
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
