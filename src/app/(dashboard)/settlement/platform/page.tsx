// app/settlement/platform/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { settlementPlatformService } from "@/services/settlement-platform.service";
import {
  SettlementPlatform,
  SettlementPlatformQueryParams,
} from "@/types/settlement-platform";
import { Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { BulkSettlementPlatformModal } from "@/components/settlement/BulkSettlementPlatformModal";
import { SettlementPlatformDetailModal } from "@/components/settlement/SettlementPlatformDetailModal";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { SettlementPlatformActionCard } from "@/components/settlement/SettlementPlatformActionCard";
import { DownloadPlatformFeeModal } from "@/components/settlement/DownloadPlatformFeeModal";

const SettlementPlatformListPage = () => {
  usePageTitle("Settlement Platform");
  const router = useRouter();

  // Data states
  const [settlements, setSettlements] = useState<SettlementPlatform[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<SettlementPlatformQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<SettlementPlatform | null>(null);

  // Action states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [estimatedLoading, setEstimatedLoading] = useState(false);
  const [showPlatformFeeModal, setShowPlatformFeeModal] = useState(false);
  const [platformFeeLoading, setPlatformFeeLoading] = useState(false);

  // Fetch settlements
  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settlementPlatformService.getSettlements(filters);

      setSettlements(Array.isArray(response.data) ? response.data : []);

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
      setSettlements([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleOpenPlatformFeeModal = () => {
    setShowPlatformFeeModal(true);
  };

  const handleClosePlatformFeeModal = () => {
    setShowPlatformFeeModal(false);
  };

  const handleDownloadPlatformFee = async (
    platformId: string,
    month: string
  ) => {
    try {
      setPlatformFeeLoading(true);
      await settlementPlatformService.downloadMonthlyPlatformFee(
        platformId,
        month
      );
      toast.success("Platform fee downloaded successfully");
      handleClosePlatformFeeModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setPlatformFeeLoading(false);
    }
  };

  // Detail Modal Handlers
  const openDetailModal = (settlement: SettlementPlatform) => {
    setSelectedSettlement(settlement);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSettlement(null);
  };

  // Action handlers
  const handleCreateSettlement = () => {
    router.push("/settlement/platform/create");
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      await settlementPlatformService.downloadTemplate();
      toast.success("Template downloaded successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadEstimated = async () => {
    try {
      setEstimatedLoading(true);
      await settlementPlatformService.downloadPlatformEstimated();
      toast.success("Platform estimated settlement downloaded successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setEstimatedLoading(false);
    }
  };

  const handleOpenBulkModal = () => {
    setShowBulkModal(true);
  };

  const handleCloseBulkModal = () => {
    setShowBulkModal(false);
  };

  const handleBulkSubmit = async (file: File, pin: string) => {
    try {
      setBulkLoading(true);
      await settlementPlatformService.bulkSettlement(file, pin);
      toast.success("Bulk platform settlement created successfully");
      fetchSettlements();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setBulkLoading(false);
    }
  };

  // Table columns
  const settlementColumns: TableColumn<SettlementPlatform>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-start gap-2">
            <div>
              <p className="text-sm text-gray-900">
                {new Date(row.created_at).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(row.created_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ),
      },
      {
        name: "Reference",
        selector: (row) => row.reference,
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "Amount",
        selector: (row) => row.amount,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-green-600">
              {formatCurrency(row.amount)}
            </span>
          </div>
        ),
      },
      {
        name: "Settled By",
        selector: (row) => row.settle_by_name,
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <button
            onClick={() => openDetailModal(row)}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
            title="View Detail"
          >
            <Eye className="w-4 h-4" />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Action Buttons Card */}
      <SettlementPlatformActionCard
        onCreateSettlement={handleCreateSettlement}
        onBulkUpload={handleOpenBulkModal}
        onDownloadTemplate={handleDownloadTemplate}
        onDownloadEstimated={handleDownloadEstimated}
        onDownloadPlatformFee={handleOpenPlatformFeeModal} // New prop
        downloadLoading={downloadLoading}
        estimatedLoading={estimatedLoading}
        platformFeeLoading={platformFeeLoading} // New prop
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Settlement Platform"
          description="View all platform settlement transactions"
          columns={settlementColumns}
          data={settlements}
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
            <div className="text-center py-12 bg-linear-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-4">
                  No platform settlement data available
                </p>
                <button
                  onClick={handleCreateSettlement}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
                >
                  Create First Settlement
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <SettlementPlatformDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        settlement={selectedSettlement}
      />

      {/* Bulk Upload Modal */}
      <BulkSettlementPlatformModal
        isOpen={showBulkModal}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
        isLoading={bulkLoading}
      />

      <DownloadPlatformFeeModal
        isOpen={showPlatformFeeModal}
        onClose={handleClosePlatformFeeModal}
        onSubmit={handleDownloadPlatformFee}
        isLoading={platformFeeLoading}
      />
    </div>
  );
};

export default withRoleProtection(SettlementPlatformListPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);
