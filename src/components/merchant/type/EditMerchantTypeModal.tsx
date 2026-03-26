// components/merchant/EditMerchantTypeModal.tsx
import React, { useEffect, useState } from "react";
import { X, Save, AlertCircle, Tag, DollarSign, Link2 } from "lucide-react";
import { MerchantType, UpdateMerchantTypePayload } from "@/types/merchant-type";
import { merchantTypeService } from "@/services/merchant-type.service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

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

interface EditMerchantTypeModalProps {
  isOpen: boolean;
  merchantType: MerchantType | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface EditFormData {
  name: string;
  slug: string;
  minimum: string;
  maximum: string;
}

interface EditFormErrors {
  name: string;
  slug: string;
  minimum: string;
  maximum: string;
}

export const EditMerchantTypeModal: React.FC<EditMerchantTypeModalProps> = ({
  isOpen,
  merchantType,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<EditFormData>({
    name: "",
    slug: "",
    minimum: "",
    maximum: "",
  });

  const [formErrors, setFormErrors] = useState<EditFormErrors>({
    name: "",
    slug: "",
    minimum: "",
    maximum: "",
  });

  // Update form when merchant type changes
  useEffect(() => {
    if (merchantType && isOpen) {
      setFormData({
        name: merchantType.name,
        slug: merchantType.slug,
        minimum: merchantType.minimum.toString(),
        maximum: merchantType.maximum.toString(),
      });
      setFormErrors({
        name: "",
        slug: "",
        minimum: "",
        maximum: "",
      });
    }
  }, [merchantType, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        slug: "",
        minimum: "",
        maximum: "",
      });
      setFormErrors({
        name: "",
        slug: "",
        minimum: "",
        maximum: "",
      });
    }
  }, [isOpen]);

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
    setFormErrors((prev) => ({ ...prev, name: "", slug: "" }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const validateForm = (): boolean => {
    const errors: EditFormErrors = {
      name: "",
      slug: "",
      minimum: "",
      maximum: "",
    };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    if (!formData.slug.trim()) {
      errors.slug = "Slug is required";
      isValid = false;
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
      isValid = false;
    }

    const minValue = parseFloat(formData.minimum);
    if (!formData.minimum || isNaN(minValue) || minValue < 0) {
      errors.minimum = "Minimum must be a valid positive number";
      isValid = false;
    }

    const maxValue = parseFloat(formData.maximum);
    if (!formData.maximum || isNaN(maxValue) || maxValue < 0) {
      errors.maximum = "Maximum must be a valid positive number";
      isValid = false;
    }

    if (isValid && maxValue <= minValue) {
      errors.maximum = "Maximum must be greater than minimum";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !merchantType) return;

    try {
      setIsSubmitting(true);

      const payload: UpdateMerchantTypePayload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        minimum: parseFloat(formData.minimum),
        maximum: parseFloat(formData.maximum),
      };

      await merchantTypeService.updateMerchantType(
        merchantType.merchant_type_id,
        payload
      );

      toast.success("Merchant type updated successfully");
      onSuccess();
      onClose();
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

  if (!merchantType) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Edit Merchant Type
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              ID: {merchantType.merchant_type_id}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleNameChange}
            placeholder="e.g., Premium, Standard, Basic"
            disabled={isSubmitting}
            className={
              formErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""
            }
          />
          {formErrors.name ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.name}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              The display name of the merchant type
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            Slug <span className="text-red-500">*</span>
          </Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="e.g., premium, standard, basic"
            disabled={isSubmitting}
            className={
              formErrors.slug ? "border-red-500 focus-visible:ring-red-500" : ""
            }
          />
          {formErrors.slug ? (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.slug}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              URL-friendly identifier (lowercase, numbers, and hyphens only)
            </p>
          )}
        </div>

        {/* Transaction Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Minimum Amount */}
          <div className="space-y-2">
            <Label htmlFor="minimum" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Minimum Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="minimum"
              name="minimum"
              type="number"
              value={formData.minimum}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isSubmitting}
              className={
                formErrors.minimum
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formErrors.minimum ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.minimum}
              </p>
            ) : formData.minimum ? (
              <p className="text-xs text-green-600">
                {formatCurrency(formData.minimum)}
              </p>
            ) : null}
          </div>

          {/* Maximum Amount */}
          <div className="space-y-2">
            <Label htmlFor="maximum" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Maximum Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="maximum"
              name="maximum"
              type="number"
              value={formData.maximum}
              onChange={handleInputChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              disabled={isSubmitting}
              className={
                formErrors.maximum
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {formErrors.maximum ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {formErrors.maximum}
              </p>
            ) : formData.maximum ? (
              <p className="text-xs text-green-600">
                {formatCurrency(formData.maximum)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
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
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Update Type
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};
