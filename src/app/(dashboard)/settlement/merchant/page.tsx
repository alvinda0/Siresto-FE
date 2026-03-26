// app/settlement/merchant/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { settlementMerchantService } from "@/services/settlement-merchant.service";
import {
  SettlementMerchant,
  SettlementMerchantQueryParams,
} from "@/types/settlement-merchant";
import { Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { SettlementMerchantFilter } from "@/components/settlement/SettlementMerchantFilter";
import { BulkSettlementModal } from "@/components/settlement/BulkSettlementModal";
import { SettlementActionCard } from "@/components/settlement/SettlementActionCard";
import { SettlementMerchantDetailModal } from "@/components/settlement/SettlementMerchantDetailModal";
import { VendorSelectionModal } from "@/components/settlement/VendorSelectionModal";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

const SettlementMerchantListPage = () => {
  usePageTitle("Settlement Merchant");
  const router = useRouter();

  // Data states
  const [settlements, setSettlements] = useState<SettlementMerchant[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<SettlementMerchantQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] =
    useState<SettlementMerchant | null>(null);

  // Action states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [estimatedLoading, setEstimatedLoading] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Fetch settlements
  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await settlementMerchantService.getSettlements(filters);

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

  // Filter handlers
  const handleApplyFilters = (newFilters: SettlementMerchantQueryParams) => {
    // Force create new object untuk trigger useEffect dan reset semua filter
    setFilters({ ...newFilters });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (settlement: SettlementMerchant) => {
    setSelectedSettlement(settlement);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSettlement(null);
  };

  // Action handlers
  const handleCreateSettlement = () => {
    router.push("/settlement/merchant/create");
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadLoading(true);
      await settlementMerchantService.downloadTemplate();
      toast.success("Template downloaded successfully");
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleDownloadEstimated = async () => {
    setShowVendorModal(true);
  };

  const handleVendorModalClose = () => {
    setShowVendorModal(false);
  };

  const handleVendorSubmit = async (vendorId: string) => {
    try {
      setEstimatedLoading(true);
      await settlementMerchantService.downloadMerchantEstimated(vendorId);
      toast.success("Merchant estimated settlement downloaded successfully");
      setShowVendorModal(false);
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
      await settlementMerchantService.createBulkSettlement(file, pin);
      toast.success("Bulk settlement created successfully");
      fetchSettlements();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setBulkLoading(false);
    }
  };

  // Table columns
  const settlementColumns: TableColumn<SettlementMerchant>[] = useMemo(
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
        name: "Merchant",
        selector: (row) => row.merchant_name,
        sortable: true,
      },
      {
        name: "Vendor",
        selector: (row) => row.vendor_name,
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
      {/* Filter Section */}
      <SettlementMerchantFilter onApplyFilters={handleApplyFilters} />

      {/* Action Buttons Card */}
      <SettlementActionCard
        onCreateSettlement={handleCreateSettlement}
        onBulkUpload={handleOpenBulkModal}
        onDownloadTemplate={handleDownloadTemplate}
        onDownloadEstimated={handleDownloadEstimated}
        downloadLoading={downloadLoading}
        estimatedLoading={estimatedLoading}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Settlement Merchant"
          description="View all merchant settlement transactions"
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-4">
                  No settlement data available
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
      <SettlementMerchantDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        settlement={selectedSettlement}
      />

      {/* Bulk Upload Modal */}
      <BulkSettlementModal
        isOpen={showBulkModal}
        onClose={handleCloseBulkModal}
        onSubmit={handleBulkSubmit}
        isLoading={bulkLoading}
      />

      {/* Vendor Selection Modal */}
      <VendorSelectionModal
        isOpen={showVendorModal}
        onClose={handleVendorModalClose}
        onSubmit={handleVendorSubmit}
        isLoading={estimatedLoading}
      />
    </div>
  );
};

export default withRoleProtection(SettlementMerchantListPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);