import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { Minus } from "lucide-react";
import { Modal } from "@/components/Modal";

interface ReductionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    platform_id: string;
    amount: number;
    admin_cost: number;
    reason: string;
    twofa_token: string;
  }) => Promise<void>;
  isLoading: boolean;
  platformId?: string;
  platformName?: string;
  walletData?: {
    pending_balance: number;
  };
  walletLoading?: boolean;
}

export const ReductionDialog: React.FC<ReductionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  platformId = "",
  platformName = "",
  walletData,
  walletLoading = false,
}) => {
  const [formData, setFormData] = useState({
    platform_id: "",
    amount: "",
    admin_cost: "",
    reason: "",
    twofa_token: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update platform_id when platformId prop changes
  React.useEffect(() => {
    if (platformId) {
      setFormData(prev => ({ ...prev, platform_id: platformId }));
    }
  }, [platformId]);

  // Update twofa_token when OTP values change
  React.useEffect(() => {
    const token = otpValues.join("");
    setFormData(prev => ({ ...prev, twofa_token: token }));
  }, [otpValues]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits and limit to 1 character
    if (value.length > 1 || (value && !/^\d$/.test(value))) {
      return;
    }

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (errors.twofa_token) {
      setErrors(prev => ({ ...prev, twofa_token: "" }));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtpValues = [...otpValues];
    
    for (let i = 0; i < 6; i++) {
      newOtpValues[i] = pastedData[i] || "";
    }
    
    setOtpValues(newOtpValues);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtpValues.findIndex(val => !val);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    otpRefs.current[focusIndex]?.focus();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!platformId) {
      newErrors.platform_id = "Platform must be selected";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.admin_cost || parseFloat(formData.admin_cost) < 0) {
      newErrors.admin_cost = "Admin cost must be 0 or greater";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Reason is required";
    }

    if (formData.twofa_token.length !== 6) {
      newErrors.twofa_token = "2FA Token must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onConfirm({
        platform_id: platformId,
        amount: parseFloat(formData.amount),
        admin_cost: parseFloat(formData.admin_cost),
        reason: formData.reason,
        twofa_token: formData.twofa_token,
      });
      
      // Reset form on success
      setFormData({
        platform_id: platformId,
        amount: "",
        admin_cost: "",
        reason: "",
        twofa_token: "",
      });
      setOtpValues(["", "", "", "", "", ""]);
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    setFormData({
      platform_id: platformId,
      amount: "",
      admin_cost: "",
      reason: "",
      twofa_token: "",
    });
    setOtpValues(["", "", "", "", "", ""]);
    setErrors({});
    onClose();
  };

  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const adminCost = parseFloat(formData.admin_cost) || 0;
    return amount + adminCost;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isLoading ? handleClose : () => {}}
      title="Manual Reduction Request"
      size="md"
    >
      {/* Platform Description */}
      <div className="mb-4">
        <p className="text-gray-600 text-sm leading-relaxed">
          Create a manual reduction for platform{" "}
          {platformName && (
            <span className="font-semibold text-gray-800">
              {platformName}
            </span>
          )}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wallet Information */}
        <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-lg border border-blue-200/50">
            {walletLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-blue-700">Loading wallet data...</span>
              </div>
            ) : walletData ? (
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 font-semibold">Pending Balance:</span>
                <span className="font-bold text-blue-900">Rp.{formatCurrency(walletData.pending_balance)}</span>
              </div>
            ) : (
              <div className="text-center py-2">
                <span className="text-sm text-blue-600 italic">Wallet data not available</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
              className={`bg-white/50 backdrop-blur-sm ${errors.amount ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_cost" className="text-sm font-semibold">
              Admin Cost <span className="text-red-500">*</span>
            </Label>
            <Input
              id="admin_cost"
              type="number"
              value={formData.admin_cost}
              onChange={(e) => handleInputChange("admin_cost", e.target.value)}
              placeholder="Enter admin cost"
              min="0"
              step="0.01"
              className={`bg-white/50 backdrop-blur-sm ${errors.admin_cost ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.admin_cost && (
              <p className="text-sm text-red-600">{errors.admin_cost}</p>
            )}
          </div>

          {(formData.amount || formData.admin_cost) && (
            <div className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin Cost:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(formData.admin_cost) || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t pt-2 mt-2">
                  <span>Total:</span>
                  <span className="text-red-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Enter reason for reduction"
              rows={3}
              className={`bg-white/50 backdrop-blur-sm resize-none ${errors.reason ? "border-red-500" : ""}`}
              disabled={isLoading}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              2FA Token <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2 justify-center">
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className={`w-12 h-12 text-center text-lg font-semibold border rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.twofa_token ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
              ))}
            </div>
            {errors.twofa_token && (
              <p className="text-sm text-red-600 text-center">{errors.twofa_token}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                "Create Reduction"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    );
  };