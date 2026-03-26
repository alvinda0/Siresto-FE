"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { platformService } from "@/services/platform.service";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { AgentType, CreateAgentPayload } from "@/types/agent";
import { Platform } from "@/types/platform";
import { agentService } from "@/services/agent.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { SelectInput } from "@/components/SelectInput";

interface FormData {
  name: string;
  email: string;
  phone_number: string;
  platform_id: string;
  agent_type_id: string;
  fee: string;
  hide_fee: string;
  status: string;
  admin_fee: string;
}

const CreateAgentPage = () => {
  usePageTitle("Create Agent");
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone_number: "",
    platform_id: "",
    agent_type_id: "",
    fee: "",
    hide_fee: "",
    status: "ACTIVE",
    admin_fee: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [platformsData, agentTypesData] = await Promise.all([
          platformService.getAllPlatforms(),
          agentService.getAllAgentTypes(),
        ]);
        // Both platforms and agent types are already limited to 100 by their respective methods
        setPlatforms(platformsData);
        setAgentTypes(agentTypesData);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("Agent name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      setError("Invalid email format");
      return false;
    }
    if (!formData.phone_number.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (formData.admin_fee && isNaN(parseFloat(formData.admin_fee))) {
      setError("Admin fee must be a valid number");
      return false;
    }
    if (formData.admin_fee && parseFloat(formData.admin_fee) < 0) {
      setError("Admin fee must be a positive number");
      return false;
    }

    // Validate phone number format: must start with +62 or 08
    const phoneNumber = formData.phone_number.trim();
    if (!phoneNumber.startsWith("+62") && !phoneNumber.startsWith("08")) {
      setError("Phone number must start with +62 or 08");
      return false;
    }

    // Check minimum length based on format
    if (phoneNumber.startsWith("+62") && phoneNumber.length < 12) {
      setError(
        "Phone number is too short (minimum 12 characters for +62 format)"
      );
      return false;
    }
    if (phoneNumber.startsWith("08") && phoneNumber.length < 10) {
      setError(
        "Phone number is too short (minimum 10 characters for 08 format)"
      );
      return false;
    }

    if (!formData.platform_id) {
      setError("Platform is required");
      return false;
    }
    if (!formData.agent_type_id) {
      setError("Agent type is required");
      return false;
    }
    if (!formData.fee) {
      setError("Fee is required");
      return false;
    }
    if (isNaN(parseFloat(formData.fee)) || parseFloat(formData.fee) < 0.7) {
      setError("Fee must be at least 0.7%");
      return false;
    }
    if (formData.hide_fee && isNaN(parseFloat(formData.hide_fee))) {
      setError("Hide fee must be a valid number");
      return false;
    }
    if (formData.hide_fee && parseFloat(formData.hide_fee) < 0) {
      setError("Hide fee must be a positive number");
      return false;
    }
    if (formData.hide_fee && parseFloat(formData.hide_fee) >= parseFloat(formData.fee)) {
      setError("Hide fee must be less than commission fee");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateAgentPayload = {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        platform_id: formData.platform_id,
        agent_type_id: formData.agent_type_id,
        fee: parseFloat(formData.fee),
        status: formData.status,
      };

      // Add hide_fee only if it has a value
      if (formData.hide_fee && formData.hide_fee.trim() !== "") {
        payload.hide_fee = parseFloat(formData.hide_fee);
      }
      if (formData.admin_fee && formData.admin_fee.trim() !== "") {
        payload.admin_fee = parseFloat(formData.admin_fee);
      }

      await agentService.createAgent(payload);
      toast.success("Agent created successfully");
      router.push(`/agent/list`);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Create New Agent</h1>
          <p className="text-sm text-gray-600">
            Fill in the form below to create a new agent
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter agent name"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Row 2: Phone Number and Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="08123456789"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Row 3b: Admin Fee */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Fee (Rp) <span className="text-gray-400 font-normal text-xs">- Opsional</span>
              </label>
              <input
                type="number"
                name="admin_fee"
                value={formData.admin_fee}
                onChange={handleInputChange}
                placeholder="Enter admin fee (optional)"
                step="1"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Commission Fee (%) *
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleInputChange}
                placeholder="Enter fee percentage (min 0.7%)"
                step="0.1"
                min="0.7"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum fee: 0.7%</p>
            </div>
          </div>

          {/* Row 3: Hide Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hide Fee (%)
              </label>
              <input
                type="number"
                name="hide_fee"
                value={formData.hide_fee}
                onChange={handleInputChange}
                placeholder="Enter hide fee percentage (optional)"
                step="0.1"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - Must be less than commission fee if provided</p>
            </div>
          </div>

          {/* Row 4: Platform and Agent Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Platform *
              </label>
              <SelectInput
                data={platforms}
                value={formData.platform_id}
                onChange={(value) => setFormData(prev => ({ ...prev, platform_id: value }))}
                valueKey="platform_id"
                labelKey="name"
                secondaryLabelKey="referral"
                placeholder="Select a platform"
                searchPlaceholder="Search platforms..."
                emptyText="No platforms found."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Agent Type *
              </label>
              <SelectInput
                data={agentTypes}
                value={formData.agent_type_id}
                onChange={(value) => setFormData(prev => ({ ...prev, agent_type_id: value }))}
                valueKey="agent_type_id"
                labelKey="type"
                placeholder="Select an agent type"
                searchPlaceholder="Search agent types..."
                emptyText="No agent types found."
                className="w-full"
              />
            </div>
          </div>

          {/* Row 5: Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors font-medium flex items-center justify-center gap-2"
            >
              {submitting && <Loader className="w-4 h-4 animate-spin" />}
              Create Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withRoleProtection(CreateAgentPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
