"use client";

import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { bankPlatformService } from "@/services/bank-platform.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface BankPlatformBulkActionsProps {
  onSuccess: () => void;
}

interface PendingPlatform {
  bank_platform_id: string;
  platform_name: string;
  account_name: string;
  status: string;
}

export const BankPlatformBulkActions: React.FC<
  BankPlatformBulkActionsProps
> = ({ onSuccess }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [pendingPlatforms, setPendingPlatforms] = useState<PendingPlatform[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchPendingPlatforms = async () => {
    try {
      setIsFetching(true);

      // Fetch Pending platforms
      const pendingResponse = await bankPlatformService.getBankPlatforms({
        status: "Pending",
        limit: 100,
      });

      // Fetch Revised platforms
      const revisedResponse = await bankPlatformService.getBankPlatforms({
        status: "Revised",
        limit: 100,
      });

      // Gabungkan kedua hasil
      const pendingData = pendingResponse.data || [];
      const revisedData = revisedResponse.data || [];
      const combinedData = [...pendingData, ...revisedData];

      const platforms = combinedData.map((p) => ({
        bank_platform_id: p.bank_platform_id,
        platform_name: p.platform_name,
        account_name: p.account_name,
        status: p.status, // Tambahkan status
      }));

      setPendingPlatforms(platforms);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setPendingPlatforms([]);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchPendingPlatforms();
  }, []);

  const openModal = async (type: "accept" | "reject") => {
    // Fetch fresh data ketika modal dibuka
    await fetchPendingPlatforms();

    if (pendingPlatforms.length === 0) {
      toast.error("No pending or revised platforms available for bulk action");
      return;
    }

    setModalType(type);
    setReason("");
    setSelectedIds([]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setReason("");
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === pendingPlatforms.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingPlatforms.map((p) => p.bank_platform_id));
    }
  };

  const toggleSelectPlatform = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBulkAction = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    try {
      setIsLoading(true);

      let response;
      if (modalType === "accept") {
        response = await bankPlatformService.bulkAcceptBankPlatforms(
          selectedIds,
          reason.trim(),
        );
        toast.success(
          `Successfully accepted ${response.data.success_count} bank platform(s)`,
        );
      } else {
        response = await bankPlatformService.bulkRejectBankPlatforms(
          selectedIds,
          reason.trim(),
        );
        toast.success(
          `Successfully rejected ${response.data.success_count} bank platform(s)`,
        );
      }

      closeModal();
      await fetchPendingPlatforms();
      onSuccess();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bulk Actions Card - Selalu tampil tanpa validasi */}
      <div className="backdrop-blur-md bg-white/70 border border-white/20 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => openModal("accept")}
            variant="outline"
            className="bg-green-500/10 hover:bg-green-500/20 text-green-700 border-green-500/30 hover:border-green-500/50"
          >
            <Check className="w-4 h-4 mr-2" />
            Bulk Accept
          </Button>

          <Button
            onClick={() => openModal("reject")}
            variant="outline"
            className="bg-red-500/10 hover:bg-red-500/20 text-red-700 border-red-500/30 hover:border-red-500/50"
          >
            <X className="w-4 h-4 mr-2" />
            Bulk Reject
          </Button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/90 border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                {modalType === "accept" ? "Bulk Accept" : "Bulk Reject"}{" "}
                Platforms
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Select platforms to {modalType} and provide a reason
              </p>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {isFetching ? (
                <div className="flex items-center justify-center gap-2 text-gray-600 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading pending platforms...</span>
                </div>
              ) : pendingPlatforms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending platforms available
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                    <Checkbox
                      id="select-all"
                      checked={selectedIds.length === pendingPlatforms.length}
                      onCheckedChange={toggleSelectAll}
                    />
                    <label
                      htmlFor="select-all"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Select All ({pendingPlatforms.length} platforms)
                    </label>
                    {selectedIds.length > 0 && (
                      <span className="ml-auto text-sm text-blue-600 font-medium">
                        {selectedIds.length} selected
                      </span>
                    )}
                  </div>

                  {/* List of platforms */}
                  <div className="space-y-2 mb-6">
                    {pendingPlatforms.map((platform) => (
                      <div
                        key={platform.bank_platform_id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          selectedIds.includes(platform.bank_platform_id)
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Checkbox
                          id={platform.bank_platform_id}
                          checked={selectedIds.includes(
                            platform.bank_platform_id,
                          )}
                          onCheckedChange={() =>
                            toggleSelectPlatform(platform.bank_platform_id)
                          }
                        />
                        <label
                          htmlFor={platform.bank_platform_id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">
                              {platform.platform_name}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                platform.status === "Pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {platform.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {platform.account_name}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Reason Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={`Enter reason for ${
                        modalType === "accept" ? "accepting" : "rejecting"
                      } selected platforms...`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center gap-3">
              <Button
                onClick={closeModal}
                disabled={isLoading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkAction}
                disabled={
                  isLoading ||
                  !reason.trim() ||
                  selectedIds.length === 0 ||
                  isFetching
                }
                className={`flex-1 ${
                  modalType === "accept"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm {modalType === "accept" ? "Accept" : "Reject"} (
                    {selectedIds.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
