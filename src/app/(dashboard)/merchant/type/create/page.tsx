"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { merchantTypeService } from "@/services/merchant-type.service";
import { CreateMerchantTypePayload } from "@/types/merchant-type";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { ArrowLeft, Tag, DollarSign, Link2 } from "lucide-react";
import { get } from "http";
import { getErrorMessage } from "@/lib/utils";

const CreateMerchantTypePage = () => {
  usePageTitle("Create Merchant Type");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    minimum: "",
    maximum: "",
  });

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    setFormData((prev) => ({
      ...prev,
      name: name,
      slug: slug,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return "";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.slug ||
      !formData.minimum ||
      !formData.maximum
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const minValue = parseFloat(formData.minimum);
    const maxValue = parseFloat(formData.maximum);

    if (isNaN(minValue) || minValue < 0) {
      toast.error("Minimum must be a valid positive number");
      return;
    }

    if (isNaN(maxValue) || maxValue < 0) {
      toast.error("Maximum must be a valid positive number");
      return;
    }

    if (maxValue <= minValue) {
      toast.error("Maximum must be greater than minimum");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      toast.error(
        "Slug must contain only lowercase letters, numbers, and hyphens"
      );
      return;
    }

    try {
      setLoading(true);

      const payload: CreateMerchantTypePayload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        minimum: minValue,
        maximum: maxValue,
      };

      await merchantTypeService.createMerchantType(payload);
      toast.success("Merchant type created successfully");
      router.push("/merchant/type");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create Merchant Type
          </h1>
          <p className="text-sm text-gray-600">
            Add a new merchant type with transaction limits
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4" />
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g., Premium, Standard, Basic"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The display name of the merchant type
            </p>
          </div>

          {/* Slug */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Link2 className="w-4 h-4" />
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., premium, standard, basic"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly identifier (lowercase, numbers, and hyphens only)
            </p>
          </div>

          {/* Transaction Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Minimum Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="minimum"
                value={formData.minimum}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              {formData.minimum && (
                <p className="text-xs text-green-600 mt-1">
                  {formatCurrency(formData.minimum)}
                </p>
              )}
            </div>

            {/* Maximum Amount */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4" />
                Maximum Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maximum"
                value={formData.maximum}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              {formData.maximum && (
                <p className="text-xs text-green-600 mt-1">
                  {formatCurrency(formData.maximum)}
                </p>
              )}
            </div>
          </div>

          {/* Range Preview */}
          {formData.minimum &&
            formData.maximum &&
            parseFloat(formData.maximum) > parseFloat(formData.minimum) && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Transaction Range Preview
                </p>
                <p className="text-lg font-semibold text-blue-700 mt-1">
                  {formatCurrency(formData.minimum)} -{" "}
                  {formatCurrency(formData.maximum)}
                </p>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Merchant Type"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default withRoleProtection(CreateMerchantTypePage, [
  "Superuser",
  "Supervisor",
]);
