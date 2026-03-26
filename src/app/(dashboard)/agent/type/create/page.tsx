"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  Type,
  ArrowLeft,
} from "lucide-react";
import { agentTypeService } from "@/services/agentType.service";
import { CreateAgentTypePayload } from "@/types/agentType";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { Textarea } from "@/components/ui/text-area";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const CreateAgentTypePage = () => {
  usePageTitle("Create Agent Type");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<CreateAgentTypePayload>({
    type: "",
    description: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CreateAgentTypePayload, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateAgentTypePayload, string>> = {};

    if (!formData.type || !formData.type.trim()) {
      errors.type = "Type is required";
    } else if (formData.type.trim().length < 2) {
      errors.type = "Type must be at least 2 characters";
    }

    if (!formData.description || !formData.description.trim()) {
      errors.description = "Description is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await agentTypeService.createAgentType(formData);
      toast.success("Agent type created successfully");
      setSuccess(true);
      setTimeout(() => {
        router.push("/agent/type");
      }, 2000);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof CreateAgentTypePayload,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Agent Type Created Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Redirecting to agent type list...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007BFF] mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create New Agent Type
          </h1>
          <p className="text-sm text-gray-600">
            Add a new agent type to the system
          </p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#007BFF]/10 rounded-lg">
              <Plus className="w-6 h-6 text-[#007BFF]" />
            </div>
            <div>
              <CardTitle className="text-2xl">Agent Type Information</CardTitle>
              <CardDescription>Fill in the details below</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-500" />
                Type
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="type"
                type="text"
                placeholder="Enter type name"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                onKeyPress={handleKeyPress}
                className={formErrors.type ? "border-red-500" : ""}
              />
              {formErrors.type && (
                <p className="text-sm text-red-600">{formErrors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" />
                Description
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e: { target: { value: string } }) =>
                  handleInputChange("description", e.target.value)
                }
                className={formErrors.description ? "border-red-500" : ""}
                rows={4}
              />
              {formErrors.description && (
                <p className="text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#007BFF] hover:bg-[#0066DD] text-white px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Agent Type
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withRoleProtection(CreateAgentTypePage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
