// components/settlement/DownloadPlatformFeeModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { Platform } from "@/types/platform";
import { platformService } from "@/services/platform.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface DownloadPlatformFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (platformId: string, month: string) => Promise<void>;
  isLoading: boolean;
}

export function DownloadPlatformFeeModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: DownloadPlatformFeeModalProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Generate 3 bulan terakhir (termasuk bulan ini)
  const generateLast3Months = () => {
    const months = [];
    const today = new Date();
    
    // Loop 3 bulan terakhir, mulai dari bulan ini
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const monthValue = `${year}-${month}`;
      
      const monthLabel = targetDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      
      months.push({ value: monthValue, label: monthLabel });
    }

    return months;
  };

  const availableMonths = generateLast3Months();

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms();
    }
  }, [isOpen]);

  const fetchPlatforms = async () => {
    try {
      setLoadingPlatforms(true);
      const data = await platformService.getPlatformsForSelect();
      setPlatforms(data.filter((p) => p.status === "ACTIVE"));
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoadingPlatforms(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlatform || !selectedMonth) {
      toast.error("Please select platform and month");
      return;
    }

    await onSubmit(selectedPlatform, selectedMonth);
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedPlatform("");
      setSelectedMonth("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Download Platform Fee
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Platform Select */}
          <div className="space-y-2">
            <Label htmlFor="platform" className="text-sm font-medium text-gray-700">
              Select Platform
            </Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
              disabled={loadingPlatforms || isLoading}
            >
              <SelectTrigger
                id="platform"
                className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-purple-500"
              >
                <SelectValue
                  placeholder={
                    loadingPlatforms ? "Loading platforms..." : "Choose platform"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem
                    key={platform.platform_id}
                    value={platform.platform_id}
                  >
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Select */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium text-gray-700">
              Select Month
            </Label>
            <Select
              value={selectedMonth}
              onValueChange={setSelectedMonth}
              disabled={isLoading}
            >
              <SelectTrigger
                id="month"
                className="w-full bg-white border-gray-300 focus:ring-2 focus:ring-purple-500"
              >
                <SelectValue placeholder="Choose month" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || loadingPlatforms || !selectedPlatform || !selectedMonth}
              className="flex-1 bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}