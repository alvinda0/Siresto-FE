// app/bank-platform/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Eye, Check, X } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BankPlatform, BankPlatformQueryParams } from "@/types/bank-platform";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { bankPlatformService } from "@/services/bank-platform.service";
import { BankPlatformFilter } from "@/components/platform/bank/BankPlatformFilter";
import { BankPlatformActionModal } from "@/components/platform/bank/BankPlatformActionModal";
import { BankPlatformDetailModal } from "@/components/platform/bank/BankPlatformDetailModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { BankPlatformBulkActions } from "@/components/platform/bank/BankPlatformBulkActions";

const ListBankPlatformPage = () => {
  usePageTitle("Bank Platform List");
  const router = useRouter();
  const [bankPlatforms, setBankPlatforms] = useState<BankPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<BankPlatformQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBankPlatformForDetail, setSelectedBankPlatformForDetail] =
    useState<BankPlatform | null>(null);

  // Action Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<BankPlatform | null>(
    null
  );

  const fetchBankPlatforms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankPlatformService.getBankPlatforms(filters);

      setBankPlatforms(Array.isArray(response.data) ? response.data : []);

      if (response.metadata) {
        setPagination({
          total: response.metadata.total,
          totalPages: response.metadata.total_pages,
          currentPage: response.metadata.page,
          limit: response.metadata.limit,
        });
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setBankPlatforms([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBankPlatforms();
  }, [fetchBankPlatforms]);

  const handleApplyFilters = (newFilters: BankPlatformQueryParams, isClear?: boolean) => {
    if (isClear) {
      // Reset all filters to default values
      setFilters({ page: 1, limit: newFilters.limit || 10 });
    } else {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (bankPlatform: BankPlatform) => {
    setSelectedBankPlatformForDetail(bankPlatform);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedBankPlatformForDetail(null);
  };

  // Action Modal Handlers
  const openModal = (platform: BankPlatform, type: "accept" | "reject") => {
    setSelectedPlatform(platform);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPlatform(null);
    setModalType(null);
  };

  const handleAccept = async (reason: string) => {
    if (!selectedPlatform) return;

    try {
      setActionLoading(selectedPlatform.bank_platform_id);

      const updatedPlatform = await bankPlatformService.acceptBankPlatform(
        selectedPlatform.bank_platform_id,
        reason
      );

      setBankPlatforms((prev) =>
        prev.map((platform) =>
          platform.bank_platform_id === selectedPlatform.bank_platform_id
            ? updatedPlatform
            : platform
        )
      );

      toast.success("Bank platform accepted successfully");
      closeModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!selectedPlatform) return;

    try {
      setActionLoading(selectedPlatform.bank_platform_id);

      const updatedPlatform = await bankPlatformService.rejectBankPlatform(
        selectedPlatform.bank_platform_id,
        reason
      );

      setBankPlatforms((prev) =>
        prev.map((platform) =>
          platform.bank_platform_id === selectedPlatform.bank_platform_id
            ? updatedPlatform
            : platform
        )
      );

      toast.success("Bank platform rejected successfully");
      closeModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      Accepted: "text-green-700",
      Pending: "text-yellow-700",
      Rejected: "text-red-700",
      Revised: "text-blue-700",
    };
    return colors[status] || "text-gray-700";
  };

  const bankPlatformColumns: TableColumn<BankPlatform>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {new Date(row.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        ),
      },
      {
        name: "Account Number",
        selector: (row) => row.account_number,
        sortable: true,
      },
      {
        name: "Bank Name",
        selector: (row) => row.bank_name,
        sortable: true,
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-800">{row.bank_name}</div>
            <div className="text-xs text-gray-500">Code: {row.bank_code}</div>
          </div>
        ),
      },
      {
        name: "Account Name",
        selector: (row) => row.account_name,
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        cell: (row) => (
          <span className={`text-xs font-bold ${getStatusColor(row.status)}`}>
            {row.status}
          </span>
        ),
      },
      {
        name: "Created By",
        selector: (row) => row.created_by_name,
        sortable: true,
      },
      {
        name: "Accepted By",
        selector: (row) => row.accepted_by_name || "-",
        sortable: true,
      },
      {
        name: "Reason",
        selector: (row) => row.reason || "-",
        sortable: true,
        cell: (row) => (
          <div className="max-w-xs">
            <span
              className="text-sm text-gray-600 line-clamp-2"
              title={row.reason || "-"}
            >
              {row.reason || "-"}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openDetailModal(row)}
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {(row.status === "Pending" || row.status === "Revised") && (
              <>
                <button
                  onClick={() => openModal(row, "accept")}
                  disabled={actionLoading === row.bank_platform_id}
                  className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 rounded-lg transition-all duration-200 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Accept"
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openModal(row, "reject")}
                  disabled={actionLoading === row.bank_platform_id}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-all duration-200 border border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ),
      },
    ],
    [actionLoading]
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Filter Section */}
      <BankPlatformFilter onApplyFilters={handleApplyFilters} />

      <BankPlatformBulkActions
        onSuccess={fetchBankPlatforms}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Bank Platform List"
          description="All bank platform accounts with their status and information"
          columns={bankPlatformColumns}
          data={bankPlatforms}
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={pagination.total}
          paginationDefaultPage={pagination.currentPage}
          paginationPerPage={pagination.limit}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          onChangeRowsPerPage={handlePerRowsChange}
          onChangePage={handlePageChange}
          noDataComponent={
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 text-gray-400 mb-4">
                  <svg
                    className="w-full h-full"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No bank platform data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <BankPlatformDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        bankPlatform={selectedBankPlatformForDetail}
      />

      {/* Action Modal */}
      <BankPlatformActionModal
        isOpen={showModal}
        onClose={closeModal}
        platform={selectedPlatform}
        type={modalType || "accept"}
        onConfirm={modalType === "accept" ? handleAccept : handleReject}
        isLoading={actionLoading !== null}
      />
    </div>
  );
};

export default withRoleProtection(ListBankPlatformPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
  "StaffEntry",
]);
