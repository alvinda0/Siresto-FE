"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { transferService } from "@/services/transferService";
import { Transfer, TransferQueryParams } from "@/types/transfer";
import { flashpayService } from "@/services/flashpay.service";
import { FlashpayBalance } from "@/types/flashpay";
import { walletMerchantService } from "@/services/wallet-merchant.service";
import { WalletMerchant } from "@/types/wallet-merchant";
import { Check, Copy, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { TransferFilter } from "@/components/transfer/TransferFilter";
import { TransferDetailModal } from "@/components/transfer/TransferDetailModal";
import { CombineBalanceModal } from "@/components/transfer/CombineBalanceModal";

const TransferPage = () => {
  usePageTitle("Transfer List");

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [flashpayBalances, setFlashpayBalances] = useState<FlashpayBalance[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [merchantWallets, setMerchantWallets] = useState<Map<string, WalletMerchant>>(new Map());
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState<FlashpayBalance | null>(null);
  const [combineLoading, setCombineLoading] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<TransferQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transferService.getTransfers(filters);

      setTransfers(Array.isArray(response.data) ? response.data : []);

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
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchFlashpayBalances = useCallback(async () => {
    try {
      setBalancesLoading(true);
      const response = await flashpayService.getBalances();
      const balances = Array.isArray(response.data) ? response.data : [];
      setFlashpayBalances(balances);

      // Fetch wallet merchant for each merchant_id
      const walletMap = new Map<string, WalletMerchant>();
      
      await Promise.all(
        balances.map(async (balance) => {
          try {
            const walletResponse = await walletMerchantService.getWalletMerchants({
              merchant_id: balance.merchant_id,
              limit: 1,
            });
            
            const wallet = Array.isArray(walletResponse.data) 
              ? walletResponse.data[0] 
              : walletResponse.data;
            
            if (wallet) {
              walletMap.set(balance.merchant_id, wallet);
            }
          } catch (error) {
            console.error(`Failed to fetch wallet for merchant ${balance.merchant_id}:`, error);
          }
        })
      );

      setMerchantWallets(walletMap);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setFlashpayBalances([]);
    } finally {
      setBalancesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    fetchFlashpayBalances();
  }, [fetchFlashpayBalances]);

  const handleApplyFilters = (newFilters: TransferQueryParams) => {
    setFilters({ ...newFilters });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleCombineClick = (balance: FlashpayBalance) => {
    setSelectedBalance(balance);
    setShowCombineModal(true);
  };

  const handleCombineConfirm = async (twoFaCode: string) => {
    if (!selectedBalance) return;

    try {
      setCombineLoading(true);
      await flashpayService.combineBalance({
        to_wallet_id: selectedBalance.wallet_id,
        two_fa: twoFaCode,
      });

      toast.success("Balance combined successfully");
      setShowCombineModal(false);
      setSelectedBalance(null);
      
      // Refresh data
      fetchFlashpayBalances();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setCombineLoading(false);
    }
  };

  const handleViewDetail = async (transfer: Transfer) => {
    try {
      setDetailLoading(true);
      setShowDetailModal(true);
      const detailData = await transferService.getTransferById(transfer.id);
      setSelectedTransfer(detailData);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const formatDateTime = (
    dateString: string | null
  ): { date: string; time: string } => {
    if (!dateString) return { date: "-", time: "-" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID"),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const transferColumns: TableColumn<Transfer>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        width: "140px",
        cell: (row) => {
          const dateTime = formatDateTime(row.created_at);
          return (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-sm font-medium text-slate-700">
                  {dateTime.date}
                </div>
                <div className="text-xs text-gray-500">{dateTime.time}</div>
              </div>
            </div>
          );
        },
      },
      {
        name: "Transfer ID",
        selector: (row) => row.id,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2 group">
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium text-slate-700 truncate max-w-[140px]"
                title={row.id}
              >
                {row.id}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.id, row.id);
              }}
              className="p-1.5 rounded-lg bg-white/50 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100 border border-blue-500/20 hover:border-blue-500/40"
              title="Copy Transfer ID"
            >
              {copiedId === row.id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              )}
            </button>
          </div>
        ),
      },
       {
        name: "Amount",
        selector: (row) => row.amount,
        sortable: true,
        width: "150px",
        cell: (row) => (
          <div className="text-sm font-bold text-indigo-700">
            {formatCurrency(row.amount)}
          </div>
        ),
      },
      {
        name: "From Merchant",
        selector: (row) => row.from_merchant_name,
        sortable: false,
        width: "180px",
        cell: (row) => (
          <div className="text-sm font-semibold text-orange-700">
            {row.from_merchant_name}
          </div>
        ),
      },
      {
        name: "To Merchant",
        selector: (row) => row.to_merchant_name,
        sortable: false,
        width: "180px",
        cell: (row) => (
          <div className="text-sm font-semibold text-green-700">
            {row.to_merchant_name}
          </div>
        ),
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name,
        sortable: false,
        width: "150px",
        cell: (row) => (
          <div className="text-sm font-medium">{row.agent_name}</div>
        ),
      },
     
      {
        name: "Transfer By",
        selector: (row) => row.transfer_by_name,
        sortable: false,
        width: "150px",
        cell: (row) => (
          <div className="text-sm font-medium text-slate-600">
            {row.transfer_by_name}
          </div>
        ),
      },
      {
        name: "Actions",
        width: "100px",
        cell: (row) => (
          <button
            onClick={() => handleViewDetail(row)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-all duration-200 border border-indigo-300"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        ),
      },
    ],
    [copiedId]
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <TransferFilter onApplyFilters={handleApplyFilters} />

      {/* Balance Transfer UI */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">
          Balance Transfer
        </h3>
        
        {balancesLoading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : flashpayBalances.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-gray-500">No flashpay balances available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {flashpayBalances.map((balance) => {
              const merchantWallet = merchantWallets.get(balance.merchant_id);
              
              return (
                <div
                  key={balance.wallet_id}
                  className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2.5 sm:space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          {balance.vendor_name}
                        </span>
                        <span className="text-sm sm:text-lg font-bold text-green-600 whitespace-nowrap">
                          {balance.available_balance !== null 
                            ? formatCurrency(balance.available_balance)
                            : "null"
                          }
                        </span>
                      </div>
                      <div className="border-t border-gray-300"></div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          {balance.merchant_name}
                        </span>
                        <span className="text-sm sm:text-lg font-bold text-green-600 whitespace-nowrap">
                          {merchantWallet && merchantWallet.available_balance !== null
                            ? formatCurrency(merchantWallet.available_balance)
                            : "null"
                          }
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCombineClick(balance)}
                      className="flex-shrink-0 ml-2 sm:ml-3 bg-blue-600 hover:bg-blue-700 rounded-xl w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full">
        <CustomDataTable
          title="Transfer List"
          description="Complete list of all transfers between merchants"
          columns={transferColumns}
          data={transfers}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No transfer data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      <TransferDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransfer(null);
        }}
        transfer={selectedTransfer}
      />

      <CombineBalanceModal
        isOpen={showCombineModal}
        onClose={() => {
          setShowCombineModal(false);
          setSelectedBalance(null);
        }}
        onConfirm={handleCombineConfirm}
        merchantName={selectedBalance?.merchant_name || ""}
        vendorName={selectedBalance?.vendor_name || ""}
        vendorBalance={selectedBalance?.available_balance ?? null}
        loading={combineLoading}
      />
    </div>
  );
};

export default withRoleProtection(TransferPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
  "StaffFinance",
]);
