"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { settlementMerchantService } from "@/services/settlement-merchant.service";
import { merchantService } from "@/services/merchant.service";
import { CreateSettlementMerchantPayload } from "@/types/settlement-merchant";
import { Merchant } from "@/types/merchant";
import { ArrowLeft, Building2, DollarSign, FileText } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import PinInputDialog from "@/components/PinInputDialog";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

const CreateSettlementPage = () => {
  usePageTitle("Create Settlement");
  const router = useRouter();

  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const [formData, setFormData] = useState({
    merchant_id: "",
    amount: 0,
    reference: "",
  });

  const [errors, setErrors] = useState<{
    merchant_id?: string;
    amount?: string;
  }>({});

  // Fetch merchants on mount
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        setLoadingMerchants(true);
        const data = await merchantService.getMerchants({ limit: 100 });
        setMerchants(data.data || []);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, []);

  const handleBack = () => {
    router.push("/settlement/merchant");
  };

  const validateForm = (): boolean => {
    const newErrors: { merchant_id?: string; amount?: string } = {};

    if (!formData.merchant_id) {
      newErrors.merchant_id = "Merchant is required";
    }

    if (!formData.amount || formData.amount < 50000) {
      newErrors.amount = "Amount must be at least Rp 50,000";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous errors
    setError(null);
    // Open PIN dialog
    setShowPinDialog(true);
  };

  const handlePinConfirm = async (pin: string) => {
    try {
      setSubmitting(true);
      setError(null);

      const payload: CreateSettlementMerchantPayload = {
        merchant_id: formData.merchant_id,
        amount: formData.amount,
        pin: pin,
      };

      // Add reference only if it's provided
      if (formData.reference.trim()) {
        payload.reference = formData.reference.trim();
      }

      await settlementMerchantService.createSettlement(payload);

      setSuccess(true);
      setShowPinDialog(false);
      toast.success("Settlement created successfully");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/settlement/merchant");
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
      setSuccess(false);
      setShowPinDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));

    // Clear error for this field
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const selectedMerchant = merchants.find(
    (m) => m.merchant_id === formData.merchant_id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          disabled={submitting}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Settlements</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Settlement
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new merchant settlement transaction
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Settlement Details
          </h2>

          <div className="space-y-6">
            {/* Merchant Selection */}
            <div>
              <label
                htmlFor="merchant_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Merchant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  id="merchant_id"
                  name="merchant_id"
                  value={formData.merchant_id}
                  onChange={handleInputChange}
                  disabled={loadingMerchants || submitting || success}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.merchant_id ? "border-red-500" : "border-gray-300"
                  } ${
                    loadingMerchants || submitting || success
                      ? "bg-gray-50 cursor-not-allowed"
                      : "bg-white"
                  }`}
                >
                  <option value="">
                    {loadingMerchants
                      ? "Loading merchants..."
                      : "Select merchant"}
                  </option>
                  {merchants.map((merchant) => (
                    <option
                      key={merchant.merchant_id}
                      value={merchant.merchant_id}
                    >
                      {merchant.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.merchant_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.merchant_id}
                </p>
              )}
              {selectedMerchant && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-gray-600">
                    Selected Merchant Info:
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedMerchant.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Vendor: {selectedMerchant.vendor_name} | Agent:{" "}
                    {selectedMerchant.agent_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        selectedMerchant.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedMerchant.status}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  disabled={submitting || success}
                  placeholder="Enter settlement amount (min. Rp 50,000)"
                  min="50000"
                  step="1000"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  } ${
                    submitting || success
                      ? "bg-gray-50 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              {formData.amount > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  Preview:{" "}
                  <span className="font-semibold text-green-600">
                    {formatCurrency(formData.amount)}
                  </span>
                </p>
              )}
            </div>

            {/* Reference Input (Optional) */}
            <div>
              <label
                htmlFor="reference"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reference{" "}
                <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  disabled={submitting || success}
                  placeholder="Enter reference (e.g., invoice number)"
                  maxLength={100}
                  className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    submitting || success
                      ? "bg-gray-50 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Add a reference note for this settlement (optional)
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting || success}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || loadingMerchants || success}
            className="px-6 py-2.5 bg-[#007BFF] hover:bg-[#0056b3] text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Settlement
          </button>
        </div>
      </form>

      {/* PIN Input Dialog */}
      <PinInputDialog
        isOpen={showPinDialog}
        onClose={() => {
          if (!submitting) {
            setShowPinDialog(false);
          }
        }}
        onConfirm={handlePinConfirm}
        title="Confirm Settlement Creation"
        isLoading={submitting}
        actionType="create"
        actionLabel="Create Settlement"
        loadingLabel="Creating Settlement..."
      />
    </div>
  );
};

export default withRoleProtection(CreateSettlementPage, [
  "Superuser",
  "Supervisor",
  "stafffinance",
]);
