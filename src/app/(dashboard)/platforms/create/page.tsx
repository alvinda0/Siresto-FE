"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Building2,
  Tag,
  Percent,
  CheckCircle,
  Users,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { CreatePlatformPayload } from "@/types/platform";
import { platformService } from "@/services/platform.service";
import { Partner } from "@/types/partner";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { partnerService } from "@/services/partner.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export const runtime = "edge";

const CreatePlatformPage = () => {
  usePageTitle("Create Platform");
  const router = useRouter();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    referral: "",
    fee: "",
    status: "ACTIVE",
    partner_id: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    referral: "",
    fee: "",
    partner_id: "",
  });

  // Fetch partners on mount
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoadingPartners(true);
        const data = await partnerService.getPartners();
        setPartners(data);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchPartners();
  }, []);

  // Auto clear success message and redirect
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        router.push("/platforms/list");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, router]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors = {
      name: "",
      referral: "",
      fee: "",
      partner_id: "",
    };
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Platform name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Platform name must be at least 2 characters";
      isValid = false;
    }

    // Validate referral
    if (!formData.referral.trim()) {
      errors.referral = "Referral code is required";
      isValid = false;
    } else if (formData.referral.trim().length < 2) {
      errors.referral = "Referral code must be at least 2 characters";
      isValid = false;
    }

    // Validate fee
    if (!formData.fee && formData.fee !== "0") {
      errors.fee = "Fee is required";
      isValid = false;
    } else {
      const feeValue = parseFloat(formData.fee);
      if (isNaN(feeValue)) {
        errors.fee = "Fee must be a valid number";
        isValid = false;
      } else if (feeValue < 0) {
        errors.fee = "Fee cannot be negative";
        isValid = false;
      } else if (feeValue > 100) {
        errors.fee = "Fee cannot exceed 100%";
        isValid = false;
      }
    }

    // Validate partner_id
    if (!formData.partner_id) {
      errors.partner_id = "Partner is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: CreatePlatformPayload = {
        name: formData.name.trim(),
        referral: formData.referral.trim(),
        fee: parseFloat(formData.fee),
        status: formData.status,
        partner_id: formData.partner_id,
      };

      await platformService.createPlatform(payload);
      toast.success("Platform created successfully!");
      setSuccessMessage("Platform created successfully!");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading partners state
  if (loadingPartners) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top fade-in z-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create New Platform
          </h1>
          <p className="text-sm text-gray-600">
            Add a new platform to the system
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <h2 className="text-xl font-bold text-white">Platform Information</h2>
          <p className="text-white/80 text-sm mt-1">
            Fill in the details below to create a new platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.name
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Enter platform name"
                />
              </div>
              {formErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.name}
                </p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Referral Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="referral"
                  value={formData.referral}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono ${
                    formErrors.referral
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="Enter referral code"
                />
              </div>
              {formErrors.referral && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.referral}
                </p>
              )}
            </div>

            {/* Partner */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Partner <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="partner_id"
                  value={formData.partner_id}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none ${
                    formErrors.partner_id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <option value="">Select Partner</option>
                  {partners.map((partner) => (
                    <option key={partner.partner_id} value={partner.partner_id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.partner_id && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.partner_id}
                </p>
              )}
            </div>

            {/* Fee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Platform Fee (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Percent className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="fee"
                  value={formData.fee}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    formErrors.fee
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="0.0"
                />
              </div>
              {formErrors.fee ? (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.fee}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum fee 0%, can be adjusted in 0.1% increments
                </p>
              )}
            </div>

            {/* Status */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={submitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Platform
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withRoleProtection(CreatePlatformPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
