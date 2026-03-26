// app/wallet/merchant/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import CustomDataTable from "@/components/CustomDataTable";
import { walletMerchantService } from "@/services/wallet-merchant.service";
import type {
  WalletMerchant,
  WalletMerchantQueryParams,
  WalletMerchantSummary,
} from "@/types/wallet-merchant";
import { Wallet, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { WalletMerchantFilter } from "@/components/wallet/WalletMerchantFilter";
import { EstimatedBalanceModal } from "@/components/wallet/EstimatedBalanceModal";
import { WalletMerchantDetailModal } from "@/components/wallet/WalletMerchantDetailModal";
import { toast } from "sonner";
import { WalletSummaryCards } from "@/components/wallet/WalletSummaryCard";
import { formatCurrency, getErrorMessage } from "@/lib/utils";

const WalletMerchantListPage = () => {
  usePageTitle("Wallet Merchants");
  const router = useRouter();
  const [walletMerchants, setWalletMerchants] = useState<WalletMerchant[]>([]);
  const [summary, setSummary] = useState<WalletMerchantSummary>({
    total_pending_balance: 0,
    total_available_balance: 0,
    total_balance: 0,
  });
  const [loading, setLoading] = useState(true);
  
  // Estimated Balance Modal State
  const [selectedMerchantForEstimate, setSelectedMerchantForEstimate] =
    useState<WalletMerchant | null>(null);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWalletForDetail, setSelectedWalletForDetail] =
    useState<WalletMerchant | null>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<WalletMerchantQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchWalletMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const response =
        await walletMerchantService.getWalletMerchantsWithEstimated(filters);

      const walletsData = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setWalletMerchants(walletsData);

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
      setWalletMerchants([]);
      setSummary({
        total_pending_balance: 0,
        total_available_balance: 0,
        total_balance: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWalletMerchants();
  }, [fetchWalletMerchants]);

  const handleApplyFilters = (newFilters: WalletMerchantQueryParams) => {
    // Reset semua filter dan hanya gunakan filter baru
    setFilters({ ...newFilters, page: newFilters.page || 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (wallet: WalletMerchant) => {
    setSelectedWalletForDetail(wallet);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedWalletForDetail(null);
  };

  // Estimated Balance Modal Handlers
  const handleViewEstimatedBalance = (merchant: WalletMerchant) => {
    setSelectedMerchantForEstimate(merchant);
    setIsEstimateModalOpen(true);
  };

  const handleCloseEstimateModal = () => {
    setIsEstimateModalOpen(false);
    setSelectedMerchantForEstimate(null);
  };

  const walletMerchantColumns = [
    {
      name: "Merchant Name",
      selector: (row: WalletMerchant) => row.merchant_name,
      sortable: true,
    },
    {
      name: "Agent Name",
      selector: (row: WalletMerchant) => row.agent_name,
      sortable: true,
    },
    {
      name: "Vendor Name",
      selector: (row: WalletMerchant) => row.vendor_name,
      sortable: true,
    },
    {
      name: "Pending Balance",
      selector: (row: WalletMerchant) => row.pending_balance,
      sortable: true,
      cell: (row: WalletMerchant) => (
        <span className="font-semibold text-yellow-700">
          {formatCurrency(row.pending_balance)}
        </span>
      ),
    },
    {
      name: "Available Balance",
      selector: (row: WalletMerchant) => row.available_balance,
      sortable: true,
      cell: (row: WalletMerchant) => (
        <span className="font-semibold text-green-700">
          {formatCurrency(row.available_balance)}
        </span>
      ),
    },
    {
      name: "Total Balance",
      selector: (row: WalletMerchant) => row.total_balance,
      sortable: true,
      cell: (row: WalletMerchant) => (
        <span className="font-semibold text-blue-700">
          {formatCurrency(row.total_balance)}
        </span>
      ),
    },
    {
      name: "Created At",
      selector: (row: WalletMerchant) => row.created_at,
      sortable: true,
      cell: (row: WalletMerchant) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {new Date(row.created_at).toLocaleDateString("id-ID")}
          </span>
        </div>
      ),
    },
    {
      name: "Estimated Balance",
      selector: (row: WalletMerchant) => row.estimated_balance || 0,
      sortable: true,
      cell: (row: WalletMerchant) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleViewEstimatedBalance(row);
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-all border border-blue-300"
          title="View estimated balance details"
        >
          <span className="font-medium text-xs">View</span>
        </button>
      ),
    },
    {
      name: "Actions",
      cell: (row: WalletMerchant) => (
        <button
          type="button"
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
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <WalletMerchantFilter onApplyFilters={handleApplyFilters} />

      <WalletSummaryCards summary={summary} />

      <CustomDataTable
        title="Wallet Merchants"
        description="View and manage all merchant wallets"
        columns={walletMerchantColumns}
        data={walletMerchants}
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
                No wallet merchant data available
              </p>
            </div>
          </div>
        }
      />

      {/* Detail Modal */}
      <WalletMerchantDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        walletMerchant={selectedWalletForDetail}
      />

      {/* Estimated Balance Modal */}
      {selectedMerchantForEstimate && (
        <EstimatedBalanceModal
          isOpen={isEstimateModalOpen}
          onClose={handleCloseEstimateModal}
          merchantName={selectedMerchantForEstimate.merchant_name}
          estimatedBalance={selectedMerchantForEstimate.estimated_balance || 0}
          lastUpdated={selectedMerchantForEstimate.updated_at}
        />
      )}
    </div>
  );
};

export default withRoleProtection(WalletMerchantListPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);