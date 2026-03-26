// components/transaction/DownloadModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { X, Download, Calendar, Clock } from "lucide-react";
import { TransactionDownloadParams } from "@/types/transaction";
import { useTheme } from "@/hooks/useTheme";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { platformService } from "@/services/platform.service";
import { agentService } from "@/services/agent.service";
import { vendorService } from "@/services/vendor.service";
import { merchantService } from "@/services/merchant.service";
import { transactionService } from "@/services/transaction.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { SelectInput } from "@/components/SelectInput";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { buttonPrimaryColor, secondaryTextColor } = useTheme();

  const [downloading, setDownloading] = useState(false);
  const [filters, setFilters] = useState<TransactionDownloadParams>({
    start_time: "",
    end_time: "",
    status: "",
    platform_id: "",
    agent_id: "",
    merchant_id: "",
    vendor_id: "",
  });

  // State untuk date dan time
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [endTime, setEndTime] = useState({
    hours: "23",
    minutes: "59",
    seconds: "59",
  });

  // Dropdown data
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);

  // Filtered data untuk cascading
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<any[]>([]);

  // Loading states
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  // Fetch all platforms
  useEffect(() => {
    if (!isOpen) return;

    const fetchPlatforms = async () => {
      try {
        setLoadingPlatforms(true);
        const data = await platformService.getPlatformsForSelect();
        setPlatforms(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setPlatforms([]);
      } finally {
        setLoadingPlatforms(false);
      }
    };

    fetchPlatforms();
  }, [isOpen]);

  // Fetch all agents
  useEffect(() => {
    if (!isOpen) return;

    const fetchAgents = async () => {
      try {
        setLoadingAgents(true);
        const data = await agentService.getAgentsForSelect();
        setAgents(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setAgents([]);
      } finally {
        setLoadingAgents(false);
      }
    };

    fetchAgents();
  }, [isOpen]);

  // Fetch vendors
  useEffect(() => {
    if (!isOpen) return;

    const fetchVendors = async () => {
      try {
        setLoadingVendors(true);
        const response = await vendorService.getVendors({
          page: 1,
          limit: 100,
        });
        setVendors(response.data || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setVendors([]);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, [isOpen]);

  // Fetch all merchants
  useEffect(() => {
    if (!isOpen) return;

    const fetchMerchants = async () => {
      try {
        setLoadingMerchants(true);
        const response = await merchantService.getMerchants({
          page: 1,
          limit: 100,
        });
        setMerchants(response.data || []);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
        setMerchants([]);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, [isOpen]);

  // Cascading Logic: Platform → Agent → Merchant

  // Filter agents berdasarkan platform_id
  useEffect(() => {
    if (filters.platform_id && filters.platform_id !== "") {
      const filtered = agents.filter(
        (agent) => agent.platform_id === filters.platform_id
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents([]);
    }

    // Reset agent dan merchant ketika platform berubah
    setFilters((prev) => ({
      ...prev,
      agent_id: "",
      merchant_id: "",
    }));
  }, [filters.platform_id, agents]);

  // Filter merchants berdasarkan agent_id
  useEffect(() => {
    if (filters.agent_id && filters.agent_id !== "") {
      const filtered = merchants.filter(
        (merchant) => merchant.agent_id === filters.agent_id
      );
      setFilteredMerchants(filtered);
    } else {
      setFilteredMerchants([]);
    }

    // Reset merchant ketika agent berubah
    setFilters((prev) => ({
      ...prev,
      merchant_id: "",
    }));
  }, [filters.agent_id, merchants]);

  const handleTimeChange = (
    type: "start" | "end",
    field: "hours" | "minutes" | "seconds",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    let maxValue = 59;
    if (field === "hours") maxValue = 23;

    const clampedValue = Math.min(Math.max(0, numValue), maxValue);
    const formattedValue = clampedValue.toString().padStart(2, "0");

    if (type === "start") {
      setStartTime((prev) => ({ ...prev, [field]: formattedValue }));
    } else {
      setEndTime((prev) => ({ ...prev, [field]: formattedValue }));
    }
  };

  const combineDateTime = (
    date: Date | undefined,
    time: { hours: string; minutes: string; seconds: string }
  ) => {
    if (!date) return undefined;

    const combined = new Date(date);
    combined.setHours(parseInt(time.hours));
    combined.setMinutes(parseInt(time.minutes));
    combined.setSeconds(parseInt(time.seconds));
    combined.setMilliseconds(0);

    return combined.toISOString();
  };

  // Handle Download
  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setDownloading(true);
      toast.info("Preparing download...");

      // Clean filters - remove empty values and format dates
      const cleanFilters: any = {};

      // Add datetime if selected
      const startDateTime = combineDateTime(startDate, startTime);
      const endDateTime = combineDateTime(endDate, endTime);

      if (startDateTime) cleanFilters.start_time = startDateTime;
      if (endDateTime) cleanFilters.end_time = endDateTime;

      // Add other filters
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value &&
          value !== "" &&
          key !== "start_time" &&
          key !== "end_time"
        ) {
          cleanFilters[key] = value;
        }
      });

      // Call API
      const blob = await transactionService.downloadTransactions(cleanFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Generate descriptive filename
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);

      let filename = `transactions_${timestamp}`;

      // Add platform name if selected
      if (cleanFilters.platform_id) {
        const platform = platforms.find(
          (p) => p.platform_id === cleanFilters.platform_id
        );
        if (platform) {
          filename += `_${platform.name.replace(/\s+/g, "_")}`;
        }
      }

      // Add status if selected
      if (cleanFilters.status) {
        filename += `_${cleanFilters.status}`;
      }

      a.download = `${filename}.csv`;

      // Trigger download
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("File downloaded successfully!");
      handleReset();
      onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    setFilters({
      start_time: "",
      end_time: "",
      status: "",
      platform_id: "",
      agent_id: "",
      merchant_id: "",
      vendor_id: "",
    });
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime({ hours: "00", minutes: "00", seconds: "00" });
    setEndTime({ hours: "23", minutes: "59", seconds: "59" });
    setFilteredAgents([]);
    setFilteredMerchants([]);
  };

  // Prepare data with "All" option
  const platformsWithAll = [
    { platform_id: "", name: "All Platforms" },
    ...platforms,
  ];

  const agentsWithAll = [
    { agent_id: "", name: "All Agents" },
    ...filteredAgents,
  ];

  const merchantsWithAll = [
    { merchant_id: "", name: "All Merchants" },
    ...filteredMerchants,
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Download Transactions
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Apply filters to download specific transactions
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={downloading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleDownload} className="p-6 space-y-4">
          {/* Start Date & Time */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Start Date & Time
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Start Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white/50 backdrop-blur-sm",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Start Time Inputs */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="HH"
                  value={startTime.hours}
                  onChange={(e) =>
                    handleTimeChange("start", "hours", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="23"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  placeholder="MM"
                  value={startTime.minutes}
                  onChange={(e) =>
                    handleTimeChange("start", "minutes", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="59"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  placeholder="SS"
                  value={startTime.seconds}
                  onChange={(e) =>
                    handleTimeChange("start", "seconds", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          {/* End Date & Time */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              End Date & Time
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* End Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal bg-white/50 backdrop-blur-sm",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* End Time Inputs */}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="HH"
                  value={endTime.hours}
                  onChange={(e) =>
                    handleTimeChange("end", "hours", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="23"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  placeholder="MM"
                  value={endTime.minutes}
                  onChange={(e) =>
                    handleTimeChange("end", "minutes", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="59"
                />
                <span className="text-muted-foreground">:</span>
                <Input
                  type="number"
                  placeholder="SS"
                  value={endTime.seconds}
                  onChange={(e) =>
                    handleTimeChange("end", "seconds", e.target.value)
                  }
                  className="w-16 text-center bg-white/50 backdrop-blur-sm"
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label
              htmlFor="download_status"
              className="text-sm font-semibold text-gray-700"
            >
              Status
            </Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger
                id="download_status"
                className="mt-2 bg-white/50 backdrop-blur-sm"
              >
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cascading Filters: Platform → Agent → Merchant */}
          <div className="space-y-4">
            {/* Platform */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Platform
              </Label>
              <div className="mt-2">
                <SelectInput
                  data={platformsWithAll}
                  value={filters.platform_id || ""}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      platform_id: value,
                    })
                  }
                  valueKey="platform_id"
                  labelKey="name"
                  placeholder={loadingPlatforms ? "Loading..." : "Select Platform"}
                  searchPlaceholder="Search platform..."
                  emptyText="No platforms found."
                  disabled={loadingPlatforms}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Agent */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Agent
              </Label>
              <div className="mt-2">
                <SelectInput
                  data={agentsWithAll}
                  value={filters.agent_id || ""}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      agent_id: value,
                    })
                  }
                  valueKey="agent_id"
                  labelKey="name"
                  placeholder={
                    loadingAgents
                      ? "Loading..."
                      : !filters.platform_id
                      ? "Select Platform First"
                      : filteredAgents.length === 0
                      ? "No Agents Available"
                      : "Select Agent"
                  }
                  searchPlaceholder="Search agent..."
                  emptyText="No agents found."
                  disabled={
                    loadingAgents ||
                    !filters.platform_id ||
                    filteredAgents.length === 0
                  }
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Merchant */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Merchant
              </Label>
              <div className="mt-2">
                <SelectInput
                  data={merchantsWithAll}
                  value={filters.merchant_id || ""}
                  onChange={(value) =>
                    setFilters({
                      ...filters,
                      merchant_id: value,
                    })
                  }
                  valueKey="merchant_id"
                  labelKey="name"
                  placeholder={
                    loadingMerchants
                      ? "Loading..."
                      : !filters.agent_id
                      ? "Select Agent First"
                      : filteredMerchants.length === 0
                      ? "No Merchants Available"
                      : "Select Merchant"
                  }
                  searchPlaceholder="Search merchant..."
                  emptyText="No merchants found."
                  disabled={
                    loadingMerchants ||
                    !filters.agent_id ||
                    filteredMerchants.length === 0
                  }
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Vendor (tetap menggunakan Select karena tidak diminta diubah) */}
            <div>
              <Label
                htmlFor="download_vendor"
                className="text-sm font-semibold text-gray-700"
              >
                Vendor
              </Label>
              <Select
                value={filters.vendor_id || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    vendor_id: value === "all" ? "" : value,
                  })
                }
                disabled={loadingVendors}
              >
                <SelectTrigger
                  id="download_vendor"
                  className="mt-2 bg-white/50 backdrop-blur-sm"
                >
                  <SelectValue
                    placeholder={loadingVendors ? "Loading..." : "All Vendors"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              disabled={downloading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={downloading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={downloading}
              className="flex-1 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: buttonPrimaryColor,
                color: secondaryTextColor,
              }}
            >
              <Download className="w-4 h-4" />
              {downloading ? "Downloading..." : "Download CSV"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};