// app/wallet/platform/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Wallet, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection, usePermission } from "@/components/ProtectedRoles";
import {
  WalletPlatform,
  WalletPlatformQueryParams,
  WalletPlatformSummary,
} from "@/types/wallet-platform";
import { walletPlatformService } from "@/services/wallet-platform.service";
import { WalletPlatformFilter } from "@/components/wallet/WalletPlatformFilter";
import { WalletPlatformDetailModal } from "@/components/wallet/WalletPlatformDetailModal";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { WalletSummaryCards } from "@/components/wallet/WalletSummaryCard";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { ReductionDialog } from "@/components/disburement-platform/ReductionDialog";
import { disbursementPlatformService } from "@/services/disbursement-platform.service";

const WalletPlatformListPage = () => {
  usePageTitle("Wallet Platforms");
  const router = useRouter();
  const { buttonPrimaryColor } = useTheme();
  const canManualReduction = usePermission(["Superuser", "Supervisor"]);

  // Data states
  const [wallets, setWallets] = useState<WalletPlatform[]>([]);
  const [summary, setSummary] = useState<WalletPlatformSummary>({
    total_pending_balance: 0,
    total_available_balance: 0,
    total_balance: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<WalletPlatformQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletPlatform | null>(
    null
  );

  // Reduction Dialog State
  const [showReductionDialog, setShowReductionDialog] = useState(false);
  const [selectedWalletForReduction, setSelectedWalletForReduction] = useState<WalletPlatform | null>(null);
  const [reductionLoading, setReductionLoading] = useState(false);

  // Fetch wallets
  const fetchWallets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await walletPlatformService.getWalletPlatforms(filters);

      const walletsData = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setWallets(walletsData);

      setSummary({
        total_pending_balance: response.total_pending_balance || 0,
        total_available_balance: response.total_available_balance || 0,
        total_balance: response.total_balance || 0,
      });

      if (response.metadata) {
        setPagination({
          total: response.metadata.total,
          totalPages: response.metadata.total_pages,
          currentPage: response.metadata.page,
          limit: response.metadata.limit,
        });
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      setWallets([]);
      setSummary({
        total_pending_balance: 0,
        total_available_balance: 0,
        total_balance: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  // Filter handlers
  const handleApplyFilters = (newFilters: WalletPlatformQueryParams) => {
    // Reset semua filter dan hanya gunakan filter baru
    setFilters({ ...newFilters, page: newFilters.page || 1 });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (wallet: WalletPlatform) => {
    setSelectedWallet(wallet);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedWallet(null);
  };

  // Reduction handlers
  const handleReduction = async (wallet: WalletPlatform) => {
    setSelectedWalletForReduction(wallet);
    setShowReductionDialog(true);
  };

  const handleReductionConfirm = async (reductionData: {
    platform_id: string;
    amount: number;
    admin_cost: number;
    reason: string;
    twofa_token: string;
  }) => {
    try {
      setReductionLoading(true);
      const response = await disbursementPlatformService.createReduction(reductionData);
      
      toast.success("Manual reduction created successfully");
      setShowReductionDialog(false);
      setSelectedWalletForReduction(null);
      // Refresh wallet data after successful reduction
      fetchWallets();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw error; // Re-throw to let dialog handle it
    } finally {
      setReductionLoading(false);
    }
  };

  // Table columns
  const walletColumns: TableColumn<WalletPlatform>[] = useMemo(
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
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "Pending Balance",
        selector: (row) => row.pending_balance,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-orange-700">
              {formatCurrency(row.pending_balance)}
            </span>
          </div>
        ),
      },
      {
        name: "Available Balance",
        selector: (row) => row.available_balance,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-700">
              {formatCurrency(row.available_balance)}
            </span>
          </div>
        ),
      },
      {
        name: "Total Balance",
        selector: (row) => row.total_balance,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-700">
              {formatCurrency(row.total_balance)}
            </span>
          </div>
        ),
      },
      {
        name: "Updated At",
        selector: (row) => row.updated_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {new Date(row.updated_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal(row);
              }}
              className="flex items-center gap-1 p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-colors"
              title="View Detail"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">Details</span>
            </button>

            {canManualReduction && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReduction(row);
                }}
                className="flex items-center gap-1 p-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 rounded-lg transition-colors"
                title="Manual Reduction"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
                <span className="text-xs font-medium">Reduce</span>
              </button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <WalletPlatformFilter onApplyFilters={handleApplyFilters} />

      {/* Summary Cards */}
      <WalletSummaryCards summary={summary} />

      {/* Data Table */}
      <CustomDataTable
        title="Wallet Platforms"
        description="Manage and view all platform wallets"
        columns={walletColumns}
        data={wallets}
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
                <Wallet className="w-full h-full" />
              </div>
              <p className="text-gray-600 font-medium">
                No wallet platform data available
              </p>
            </div>
          </div>
        }
      />

      {/* Detail Modal */}
      <WalletPlatformDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        wallet={selectedWallet}
      />

      {/* Reduction Dialog */}
      <ReductionDialog
        isOpen={showReductionDialog}
        onClose={() => {
          setShowReductionDialog(false);
          setSelectedWalletForReduction(null);
        }}
        onConfirm={handleReductionConfirm}
        isLoading={reductionLoading}
        platformId={selectedWalletForReduction?.platform_id || ""}
        platformName={selectedWalletForReduction?.platform_name || ""}
        walletData={selectedWalletForReduction ? {
          pending_balance: selectedWalletForReduction.pending_balance
        } : undefined}
        walletLoading={false}
      />
    </div>
  );
};

export default withRoleProtection(WalletPlatformListPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);
