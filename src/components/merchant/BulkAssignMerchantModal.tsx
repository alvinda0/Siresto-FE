import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  CheckSquare,
  Square,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Merchant } from "@/types/merchant";
import { Agent } from "@/types/agent";
import { MerchantRequest } from "@/types/merchantRequest";
import { Vendor } from "@/types/vendor";
import { agentService } from "@/services/agent.service";
import { merchantService } from "@/services/merchant.service";
import { merchantRequestService } from "@/services/merchantRequest.service";
import { vendorService } from "@/services/vendor.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { SelectInput } from "@/components/SelectInput";

interface BulkAssignMerchantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    selectedIds: string[],
    agentId: string,
    merchantRequestId?: string,
  ) => void;
  isLoading?: boolean;
  defaultAgentId?: string;
  defaultMerchantRequestId?: string;
}

export const BulkAssignMerchantModal: React.FC<
  BulkAssignMerchantModalProps
> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  defaultAgentId,
  defaultMerchantRequestId,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [inputMerchantRequestId, setInputMerchantRequestId] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [merchantRequests, setMerchantRequests] = useState<MerchantRequest[]>(
    [],
  );
  const [loadingMerchantRequests, setLoadingMerchantRequests] = useState(false);
  const [agentNotFound, setAgentNotFound] = useState(false); // 👈 NEW

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
      fetchVendors();
      fetchMerchantRequests();
      if (defaultMerchantRequestId) {
        setInputMerchantRequestId(defaultMerchantRequestId);
      }
    }
  }, [isOpen, defaultMerchantRequestId]);

  useEffect(() => {
    if (isOpen && defaultAgentId && agents.length > 0 && selectedVendorId) {
      const agentExists = agents.some(
        (agent) => agent.agent_id === defaultAgentId,
      );

      if (agentExists) {
        setAgentNotFound(false);
        fetchMerchants(defaultAgentId, selectedVendorId);
      } else {
        setAgentNotFound(true);
        setMerchants([]);
      }
    }
  }, [isOpen, defaultAgentId, agents, selectedVendorId]);

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await agentService.getAgents({ limit: 100 });
      setAgents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true);
      const response = await vendorService.getVendors({ limit: 100 });
      setVendors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const fetchMerchantRequests = async () => {
    try {
      setLoadingMerchantRequests(true);
      const response = await merchantRequestService.getMerchantRequests({
        limit: 100,
        status: "PENDING",
      });
      setMerchantRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setMerchantRequests([]);
    } finally {
      setLoadingMerchantRequests(false);
    }
  };

  const fetchMerchants = async (agentId: string, vendorId: string) => {
    try {
      setLoadingMerchants(true);
      const response = await merchantService.getMerchants({
        agent_id: agentId,
        status: "ACTIVE",
        environment: "LIVE",
        vendor_id: vendorId,
        limit: 100,
      });
      setMerchants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setMerchants([]);
    } finally {
      setLoadingMerchants(false);
    }
  };

  if (!isOpen) return null;

  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.external_id &&
        m.external_id.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleToggleAll = () => {
    if (
      selectedIds.length === filteredMerchants.length &&
      filteredMerchants.length > 0
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMerchants.map((m) => m.merchant_id));
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one merchant");
      return;
    }
    if (!selectedAgentId) {
      toast.error("Please select target agent");
      return;
    }
    onSubmit(selectedIds, selectedAgentId, inputMerchantRequestId || undefined);
  };

  const handleClose = () => {
    if (isLoading) return;
    setSelectedIds([]);
    setSearchTerm("");
    setSelectedAgentId("");
    setSelectedVendorId("");
    setInputMerchantRequestId("");
    setAgentNotFound(false);
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      ACTIVE: "bg-green-100 text-green-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      INACTIVE: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const isAllSelected =
    selectedIds.length === filteredMerchants.length &&
    filteredMerchants.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Bulk Assign Merchants
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Select merchants and assign to new agent
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
          {/* Search & Controls */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-xl p-4 border-b border-gray-200/50 space-y-3 z-10">
            {/* Search Bar & Vendor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search merchant name, vendor, or external ID..."
                  className="w-full h-10! pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  disabled={
                    isLoading ||
                    loadingMerchants ||
                    agentNotFound ||
                    !selectedVendorId
                  }
                />
              </div>

              {/* Vendor Selection */}
              <div>
                {loadingVendors ? (
                  <div className="flex items-center justify-center h-full py-2.5 bg-white rounded-lg border border-gray-300">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-600">
                      Loading vendors...
                    </span>
                  </div>
                ) : (
                  <SelectInput
                    data={vendors}
                    value={selectedVendorId}
                    onChange={(value) => {
                      setSelectedVendorId(value);
                      setSelectedIds([]); // Reset selected merchants when vendor changes
                    }}
                    valueKey="vendor_id"
                    labelKey="name"
                    placeholder="-- Select Vendor * --"
                    searchPlaceholder="Search vendor..."
                    emptyText="No vendors found"
                    disabled={isLoading || agentNotFound}
                    className="h-[42px]"
                  />
                )}
              </div>
            </div>

            {/* Select All & Counter */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleToggleAll}
                disabled={
                  isLoading ||
                  loadingMerchants ||
                  filteredMerchants.length === 0 ||
                  agentNotFound ||
                  !selectedVendorId
                }
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>
              <span className="text-sm font-medium text-gray-600">
                {selectedIds.length} of {filteredMerchants.length} selected
              </span>
            </div>
          </div>

          {/* Merchant List */}
          <div className="p-4 min-h-[400px]">
            {agentNotFound ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Source Agent Not Available
                    </h4>
                    <p className="text-sm text-amber-700">
                      The default agent ID{" "}
                      <code className="px-2 py-0.5 bg-amber-100 rounded text-xs font-mono">
                        {defaultAgentId}
                      </code>{" "}
                      is not available in this environment.
                    </p>
                    <p className="text-sm text-amber-600 mt-2">
                      This feature is only available in production environment.
                    </p>
                  </div>
                </div>
              </div>
            ) : !selectedVendorId ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  Please select a vendor first
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Choose a vendor to view available merchants
                </p>
              </div>
            ) : loadingMerchants || loadingAgents ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="mt-3 text-sm text-gray-600">
                  Loading merchants...
                </span>
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">No merchants found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm
                    ? "Try different search term"
                    : "No active merchants available"}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto scrollbar-hide">
                {filteredMerchants.map((merchant) => {
                  const isSelected = selectedIds.includes(merchant.merchant_id);
                  return (
                    <button
                      key={merchant.merchant_id}
                      onClick={() => handleToggle(merchant.merchant_id)}
                      disabled={isLoading}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all
                        ${
                          isSelected
                            ? "border-blue-500 bg-blue-50/80"
                            : "border-gray-200 hover:border-blue-300 bg-white hover:bg-gray-50"
                        }
                        ${
                          isLoading
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }
                    `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">
                                {merchant.name}
                              </h4>
                              {merchant.external_id && (
                                <p className="text-xs text-gray-500 truncate">
                                  ID: {merchant.external_id}
                                </p>
                              )}
                            </div>
                            <span
                              className={`
                                px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap
                                ${getStatusColor(
                                  merchant.status,
                                )}
                            `}
                            >
                              {merchant.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Vendor:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {merchant.vendor_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Current Agent:
                              </span>
                              <span className="ml-2 font-medium text-gray-900">
                                {merchant.agent_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Type:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {merchant.merchant_type_name || "N/A"}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Created:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {formatDate(merchant.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50/80 backdrop-blur-xl border-t border-gray-200/50 space-y-4">
          {/* Form Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Merchant Request ID Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Merchant Request ID{" "}
                <span className="text-gray-400">(Optional)</span>
              </label>
              {loadingMerchantRequests ? (
                <div className="flex items-center justify-center py-3 bg-white rounded-lg border border-gray-300">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading requests...
                  </span>
                </div>
              ) : (
                <SelectInput
                  data={merchantRequests.map((req) => ({
                    ...req,
                    display_label: `${req.agent_name} - ${req.requested_count} merchants`,
                  }))}
                  value={inputMerchantRequestId}
                  onChange={setInputMerchantRequestId}
                  valueKey="id"
                  labelKey="display_label"
                  placeholder="-- Select Merchant Request (Optional) --"
                  searchPlaceholder="Search request..."
                  emptyText="No pending requests found"
                  disabled={isLoading || agentNotFound}
                />
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional: Select an existing merchant request to link this bulk
                assignment
              </p>
            </div>

            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Agent <span className="text-red-500">*</span>
              </label>
              {loadingAgents ? (
                <div className="flex items-center justify-center py-3 bg-white rounded-lg border border-gray-300">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">
                    Loading agents...
                  </span>
                </div>
              ) : (
                <SelectInput
                  data={agents}
                  value={selectedAgentId}
                  onChange={setSelectedAgentId}
                  valueKey="agent_id"
                  labelKey="name"
                  secondaryLabelKey="platform_name"
                  placeholder="-- Select Target Agent --"
                  searchPlaceholder="Search agent..."
                  emptyText="No agents found"
                  disabled={isLoading || agentNotFound}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {selectedIds.length > 0 && selectedAgentId && !agentNotFound && (
                <span className="font-semibold text-blue-700">
                  Ready to assign {selectedIds.length} merchant
                  {selectedIds.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  selectedIds.length === 0 ||
                  !selectedAgentId ||
                  agentNotFound
                }
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>
                      Assign{" "}
                      {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
