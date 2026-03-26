// components/merchant/EditMerchantModal.tsx
import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, FileText, Key } from "lucide-react";
import { Merchant, UpdateMerchantPayload } from "@/types/merchant";
import { merchantService } from "@/services/merchant.service";
import { agentService } from "@/services/agent.service";
import { merchantTypeService } from "@/services/merchant-type.service";
import { vendorService } from "@/services/vendor.service";
import { Agent } from "@/types/agent";
import { MerchantType } from "@/types/merchant-type";
import { toast } from "sonner";

interface Vendor {
  vendor_id: string;
  name: string;
}

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

interface EditMerchantModalProps {
  isOpen: boolean;
  merchant: Merchant | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  vendor_id: string;
  agent_id: string;
  name: string;
  merchant_type_id: string;
  status: string;
  environment: string;
  external_id: string;
  api_key: string;
  reason: string;
}

interface EditFormErrors {
  vendor_id: string;
  agent_id: string;
  name: string;
  merchant_type_id: string;
  status: string;
  environment: string;
  reason: string;
}

export const EditMerchantModal: React.FC<EditMerchantModalProps> = ({
  isOpen,
  merchant,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [merchantTypes, setMerchantTypes] = useState<MerchantType[]>([]);

  const [formData, setFormData] = useState<EditFormData>({
    vendor_id: "",
    agent_id: "",
    name: "",
    merchant_type_id: "",
    status: "",
    environment: "",
    external_id: "",
    api_key: "",
    reason: "",
  });

  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    vendor_id: "",
    agent_id: "",
    name: "",
    merchant_type_id: "",
    status: "",
    environment: "",
    reason: "",
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      try {
        setIsLoading(true);
        const [vendorList, agentList, typeList] = await Promise.all([
          vendorService.getVendors(),
          agentService.getAgentsForSelect(),
          merchantTypeService.getMerchantTypes({ limit: 100 }),
        ]);

        setVendors(vendorList.data || []);
        setAgents(Array.isArray(agentList) ? agentList : []);
        setMerchantTypes(Array.isArray(typeList.data) ? typeList.data : []);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Update form when merchant changes
  useEffect(() => {
    if (merchant && isOpen) {
      setFormData({
        vendor_id: merchant.vendor_id,
        agent_id: merchant.agent_id,
        name: merchant.name,
        merchant_type_id: merchant.merchant_type_id,
        status: merchant.status,
        environment: merchant.environment,
        external_id: merchant.external_id || "",
        api_key: (merchant as any).api_key || "",
        reason: "",
      });
      setFormErrors({
        vendor_id: "",
        agent_id: "",
        name: "",
        merchant_type_id: "",
        status: "",
        environment: "",
        reason: "",
      });
    }
  }, [merchant, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        vendor_id: "",
        agent_id: "",
        name: "",
        merchant_type_id: "",
        status: "",
        environment: "",
        external_id: "",
        api_key: "",
        reason: "",
      });
      setFormErrors({
        vendor_id: "",
        agent_id: "",
        name: "",
        merchant_type_id: "",
        status: "",
        environment: "",
        reason: "",
      });
    }
  }, [isOpen]);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const errors: EditFormErrors = {
      vendor_id: "",
      agent_id: "",
      name: "",
      merchant_type_id: "",
      status: "",
      environment: "",
      reason: "",
    };
    let isValid = true;

    if (!formData.vendor_id.trim()) {
      errors.vendor_id = "Vendor is required";
      isValid = false;
    }

    if (!formData.agent_id.trim()) {
      errors.agent_id = "Agent is required";
      isValid = false;
    }

    if (!formData.name.trim()) {
      errors.name = "Merchant name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Merchant name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.merchant_type_id.trim()) {
      errors.merchant_type_id = "Merchant type is required";
      isValid = false;
    }

    if (!formData.status) {
      errors.status = "Status is required";
      isValid = false;
    }

    if (!formData.environment) {
      errors.environment = "Environment is required";
      isValid = false;
    }

    if (!formData.reason.trim()) {
      errors.reason = "Reason is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !merchant) return;

    try {
      setIsSubmitting(true);

      const payload: UpdateMerchantPayload = {
        vendor_id: formData.vendor_id,
        agent_id: formData.agent_id,
        name: formData.name.trim(),
        merchant_type_id: formData.merchant_type_id,
        status: formData.status,
        environment: formData.environment,
        reason: formData.reason.trim(),
      };

      // Add optional fields if provided
      if (formData.external_id.trim()) {
        payload.external_id = formData.external_id.trim();
      }
      if (formData.api_key.trim()) {
        payload.api_key = formData.api_key.trim();
      }

      await merchantService.updateMerchant(merchant.merchant_id, payload);

      // Call onSuccess callback immediately (parent will handle toast)
      onSuccess();

      // Close modal
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update merchant";
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

  if (!merchant) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Merchant</h2>
            <p className="text-sm text-gray-600 mt-1">
              ID: {merchant.merchant_id}
            </p>
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

      {/* Form */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vendor Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="vendor_id"
                    value={formData.vendor_id}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.vendor_id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.vendor_id} value={vendor.vendor_id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.vendor_id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.vendor_id}
                    </p>
                  )}
                </div>

                {/* Agent Select */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agent <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="agent_id"
                    value={formData.agent_id}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.agent_id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select agent...</option>
                    {agents.map((agent) => (
                      <option key={agent.agent_id} value={agent.agent_id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.agent_id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.agent_id}
                    </p>
                  )}
                </div>

                {/* Merchant Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Merchant Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter merchant name"
                    disabled={isSubmitting}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Merchant Type Select */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Merchant Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="merchant_type_id"
                    value={formData.merchant_type_id}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.merchant_type_id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select merchant type...</option>
                    {merchantTypes.map((type) => (
                      <option
                        key={type.merchant_type_id}
                        value={type.merchant_type_id}
                      >
                        {type.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.merchant_type_id && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.merchant_type_id}
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
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.status
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {formErrors.status && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.status}
                    </p>
                  )}
                </div>

                {/* Environment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Environment <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="environment"
                    value={formData.environment}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      formErrors.environment
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Environment</option>
                    <option value="DEVELOPMENT">Development</option>
                    <option value="LIVE">Live</option>
                  </select>
                  {formErrors.environment && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.environment}
                    </p>
                  )}
                </div>

                {/* External ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    External ID{" "}
                    <span className="text-gray-500 text-xs">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="external_id"
                      value={formData.external_id}
                      onChange={handleFormChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., EXT-12345"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* API Key - Hide for netzme vendor */}
                {vendors.find((v) => v.vendor_id === formData.vendor_id)?.name.toLowerCase() !== "netzme" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      API Key{" "}
                      <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="api_key"
                        value={formData.api_key}
                        onChange={handleFormChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., ak_custom123456789"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Update <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleFormChange}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${
                      formErrors.reason
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter reason for this update"
                    disabled={isSubmitting}
                  />
                  {formErrors.reason && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {formErrors.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Update Merchant
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
