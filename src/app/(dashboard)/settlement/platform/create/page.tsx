"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, DollarSign, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PinInputDialog from "@/components/PinInputDialog";
import { settlementPlatformService } from "@/services/settlement-platform.service";
import { platformService } from "@/services/platform.service";
import { Platform } from "@/types/platform";
import { getErrorMessage } from "@/lib/utils";

const CreateSettlementPage = () => {
  const router = useRouter();

  // State untuk form data
  const [platformId, setPlatformId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");

  // State untuk platforms data
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);

  // State untuk PIN dialog
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch platforms untuk select dropdown
  useEffect(() => {
    const fetchPlatforms = async () => {
      setIsLoadingPlatforms(true);
      try {
        const data = await platformService.getPlatformsForSelect();
        setPlatforms(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, []);

  // Validasi form sebelum buka PIN dialog
  const handleSubmitClick = () => {
    if (!platformId) {
      toast.error("Please select a platform");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsPinDialogOpen(true);
  };

  // Handle submit dengan PIN
  const handleConfirmWithPin = async (pin: string) => {
    setIsSubmitting(true);

    try {
      const payload = {
        platform_id: platformId,
        amount: parseFloat(amount),
        reference: reference || undefined,
        pin: pin,
      };

      const result = await settlementPlatformService.createSettlement(payload);

      toast.success("Settlement platform created successfully");
      setIsPinDialogOpen(false);

      // Redirect ke list page atau detail page
      router.push("/settlement/platform");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get selected platform name untuk display
  const selectedPlatform = platforms.find((p) => p.platform_id === platformId);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Create Settlement Platform
                </h1>
                <p className="text-sm text-gray-600">
                  Create a new settlement for platform
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 shadow-lg">
          <div className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label
                htmlFor="platform"
                className="text-gray-700 font-semibold flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-gray-600" />
                Platform
              </Label>
              <Select
                value={platformId}
                onValueChange={setPlatformId}
                disabled={isLoadingPlatforms}
              >
                <SelectTrigger className="bg-white/50 backdrop-blur border-gray-300 focus:ring-2 focus:ring-blue-200">
                  <SelectValue
                    placeholder={
                      isLoadingPlatforms
                        ? "Loading platforms..."
                        : "Select platform"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-xl border border-gray-200/50">
                  {platforms.map((platform) => (
                    <SelectItem
                      key={platform.platform_id}
                      value={platform.platform_id}
                      className="cursor-pointer hover:bg-blue-50/50 text-black"
                    >
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-gray-700 font-semibold flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4 text-gray-600" />
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter settlement amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white/50 backdrop-blur border-gray-300 focus:ring-2 focus:ring-blue-200"
                min="0"
                step="0.01"
              />
            </div>

            {/* Reference Input (Optional) */}
            <div className="space-y-2">
              <Label
                htmlFor="reference"
                className="text-gray-700 font-semibold flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-gray-600" />
                Reference{" "}
                <span className="text-xs text-gray-500 font-normal">
                  (Optional)
                </span>
              </Label>
              <Input
                id="reference"
                type="text"
                placeholder="Enter reference note"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="bg-white/50 backdrop-blur border-gray-300 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Summary Box */}
            {platformId && amount && (
              <div className="bg-blue-500/5 backdrop-blur border border-blue-500/20 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Settlement Summary
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPlatform?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-800">
                      {parseFloat(amount).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-semibold text-gray-800">
                        {reference}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 border border-gray-500/30 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClick}
              disabled={!platformId || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Settlement
            </Button>
          </div>
        </div>
      </div>

      {/* PIN Input Dialog */}
      <PinInputDialog
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onConfirm={handleConfirmWithPin}
        title="Confirm Settlement Creation"
        description="Please enter your PIN to confirm the settlement platform creation."
        itemName={selectedPlatform?.name}
        isLoading={isSubmitting}
        actionType="create"
        actionLabel="Create Settlement"
        loadingLabel="Creating Settlement..."
      />
    </div>
  );
};

export default CreateSettlementPage;
