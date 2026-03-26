import React, { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import { Building2, AlertCircle, X, Save, CheckCircle } from "lucide-react";
import { Platform, UpdatePlatformPayload } from "@/types/platform";
import { platformService } from "@/services/platform.service";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface EditPlatformModalProps {
  isOpen: boolean;
  platform: Platform | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  name: string;
  status: string;
}

interface EditFormErrors {
  name: string;
}

export const EditPlatformModal: React.FC<EditPlatformModalProps> = ({
  isOpen,
  platform,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    status: "ACTIVE",
  });

  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    name: "",
  });

  // Update form when platform changes
  useEffect(() => {
    if (platform) {
      setFormData({
        name: platform.name,
        status: platform.status,
      });
      setFormErrors({ name: "" });
      setError(null);
      setSuccessMessage(null);
    }
  }, [platform]);

  // Auto close modal on success
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, onSuccess, onClose]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name") {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: EditFormErrors = { name: "" };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Platform name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Platform name must be at least 2 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !platform) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: UpdatePlatformPayload = {
        name: formData.name.trim(),
        status: formData.status,
      };

      await platformService.updatePlatform(platform.platform_id, payload);

      setSuccessMessage("Platform updated successfully!");
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

  if (!platform) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={false}
    >
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">Edit Platform</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600">ID: {platform.platform_id}</p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Platform Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  formErrors.name
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
                placeholder="Enter platform name"
                disabled={isSubmitting}
              />
            </div>
            {formErrors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {/* Read-only Platform Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Platform Information (Read-only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Referral Code
              </p>
              <p className="text-sm font-mono font-semibold text-gray-800 bg-white px-2 py-1 rounded inline-block">
                {platform.referral}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Platform Fee
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {platform.fee}%
              </p>
            </div>
          </div>
        </div>

        {/* Read-only Partner Info */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Partner Information (Read-only)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Partner Name
              </p>
              <p className="text-sm font-semibold text-gray-800">
                {platform.partner_name}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 font-semibold mb-1">
                Partner ID
              </p>
              <p className="text-xs font-mono text-gray-800 break-all">
                {platform.partner_id}
              </p>
            </div>
          </div>
        </div>

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
                Update Platform
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
