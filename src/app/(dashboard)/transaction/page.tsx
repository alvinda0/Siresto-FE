// app/transaction/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { transactionService } from "@/services/transaction.service";
import {
  Transaction,
  TransactionDownloadParams,
  TransactionQueryParams,
} from "@/types/transaction";
import { TransactionFilter } from "@/components/transaction/TransactionFilter";
import { DownloadModal } from "@/components/transaction/DownloadModal";
import { BookMarked, Check, Copy, Eye, RefreshCcw, Send } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { ProcessingStatusModal } from "@/components/transaction/ProcessingStatusModal";
import { ResendCallbackModal } from "@/components/transaction/ResendCallbackModal";
import { BotRetryModal } from "@/components/transaction/BotRetryModal";

const TransactionPage = () => {
  usePageTitle("Transaction List");
  const router = useRouter();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [processingLoading, setProcessingLoading] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [selectedResendTransaction, setSelectedResendTransaction] =
    useState<Transaction | null>(null);

  const [showBotRetryModal, setShowBotRetryModal] = useState(false);
  const [botRetryLoading, setBotRetryLoading] = useState(false);
  const [selectedBotRetryTransaction, setSelectedBotRetryTransaction] =
    useState<Transaction | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<TransactionQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions(filters);

      setTransactions(Array.isArray(response.data) ? response.data : []);

      // Set pagination dari metadata
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
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto Refresh effect - tiap 1 menit (60000 ms)
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchTransactions();
      toast.info("Data refreshed automatically", {
        duration: 2000,
      });
    }, 60000); // 60 detik = 1 menit

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchTransactions]);

  const handleApplyFilters = (newFilters: TransactionQueryParams) => {
    // Force create new object untuk trigger useEffect
    setFilters({ ...newFilters });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh((prev) => {
      const newValue = !prev;
      if (newValue) {
        toast.success(
          "Auto refresh enabled - data will refresh every 1 minute",
        );
      } else {
        toast.info("Auto refresh disabled");
      }
      return newValue;
    });
  };

  const handleResendCallback = async () => {
    if (!selectedResendTransaction) return;

    try {
      setResendLoading(true);
      await transactionService.resendCallback(
        selectedResendTransaction.transaction_uuid,
      );

      toast.success("Callback queued successfully");
      setShowResendModal(false);
      setSelectedResendTransaction(null);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      pending: "text-yellow-700",
      paid: "text-green-700",
      expire: "text-gray-700",
      fail: "text-red-700",
      cancel: "text-orange-700",
    };
    return statusColors[status] || "text-gray-700";
  };

  const getProcessStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      on_going: "text-blue-700",
      complete: "text-green-700",
      fail: "text-red-700",
      manual: "text-orange-700",
    };
    return statusColors[status] || "text-gray-700";
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
    dateString: string | null,
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

  const handleUpdateProcessingStatus = async (
    status: string,
    reason: string,
  ) => {
    if (!selectedTransaction) return;

    try {
      setProcessingLoading(true);
      await transactionService.updateProcessingStatus(
        selectedTransaction.transaction_uuid,
        status,
        reason,
      );

      toast.success("Processing status updated successfully");
      setShowProcessingModal(false);
      setSelectedTransaction(null);

      // Refresh data
      fetchTransactions();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setProcessingLoading(false);
    }
  };

  const handleBotRetry = async () => {
    if (!selectedBotRetryTransaction) return;

    try {
      setBotRetryLoading(true);
      await transactionService.botRetry(
        selectedBotRetryTransaction.transaction_uuid,
      );
      toast.success("Bot retry queued successfully");
      setShowBotRetryModal(false);
      setSelectedBotRetryTransaction(null);
      fetchTransactions();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setBotRetryLoading(false);
    }
  };

  const transactionColumns: TableColumn<Transaction>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        width: "120px",
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
        name: "Transaction ID",
        selector: (row) => row.transaction_uuid,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2 group">
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium text-slate-700 truncate max-w-35"
                title={row.transaction_uuid}
              >
                {row.transaction_uuid}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.transaction_uuid, row.transaction_uuid);
              }}
              className="p-1.5 rounded-lg bg-white/50 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100 border border-blue-500/20 hover:border-blue-500/40"
              title="Copy Transaction ID"
            >
              {copiedId === row.transaction_uuid ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              )}
            </button>
          </div>
        ),
      },
      {
        name: "Order ID",
        selector: (row) => row.order_id,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2 group">
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold text-indigo-700 truncate max-w-35"
                title={row.order_id}
              >
                {row.order_id}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.order_id, `order-${row.transaction_uuid}`);
              }}
              className="p-1.5 rounded-lg bg-white/50 hover:bg-indigo-500/10 transition-all opacity-0 group-hover:opacity-100 border border-indigo-500/20 hover:border-indigo-500/40"
              title="Copy Order ID"
            >
              {copiedId === `order-${row.transaction_uuid}` ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-indigo-600" />
              )}
            </button>
          </div>
        ),
      },
      {
        name: "Username",
        selector: (row) => row.username || "-",
        sortable: false,
        width: "150px",
      },
      {
        name: "Method",
        selector: (row) => row.method,
        sortable: false,
        width: "100px",
        cell: (row) => (
          <div className="text-sm font-semibold">{row.method}</div>
        ),
      },
      {
        name: "Currency",
        selector: (row) => row.currency,
        sortable: false,
        width: "100px",
        cell: (row) => (
          <div className="text-sm font-semibold">{row.currency}</div>
        ),
      },
      {
        name: "Bill Amount",
        selector: (row) => row.amount,
        sortable: true,
        width: "130px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-semibold">
                {formatCurrency(row.amount)}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Actual Amount",
        selector: (row) => row.final_amount,
        sortable: true,
        width: "150px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-bold">
                {formatCurrency(row.final_amount)}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "RRN",
        selector: (row) => row.reference_number || "-",
        sortable: false,
        width: "130px",
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: false,
        width: "120px",
        cell: (row) => (
          <span
            className={`text-xs font-bold uppercase ${getStatusColor(
              row.status,
            )}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        name: "Processing Status",
        selector: (row) => row.process_status || "-",
        sortable: false,
        width: "160px",
        cell: (row) => (
          <span
            className={`text-xs font-bold uppercase ${getProcessStatusColor(
              row.process_status || "-",
            )}`}
          >
            {row.process_status || "-"}
          </span>
        ),
      },
      {
        name: "Updated by",
        selector: (row) => row.updated_name || "-",
        sortable: false,
        width: "150px",
      },
      {
        name: "Paid At",
        selector: (row) => row.paid_at || "",
        sortable: true,
        width: "140px",
        cell: (row) => {
          const dateTime = formatDateTime(row.paid_at);
          return row.paid_at ? (
            <div className="flex items-center gap-2">
              <div>
                <div className="text-xs font-medium text-slate-700">
                  {dateTime.date}
                </div>
                <div className="text-xs text-gray-500">{dateTime.time}</div>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-400">Not paid yet</span>
          );
        },
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name || "-",
        sortable: false,
        width: "120px",
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name || "-",
        sortable: false,
        width: "130px",
      },
      {
        name: "Merchant",
        selector: (row) => row.merchant_name || "-",
        sortable: false,
        width: "180px",
      },
      {
        name: "Vendor",
        selector: (row) => row.vendor_name || "-",
        sortable: false,
        width: "150px",
      },
      {
        name: "Actions",
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTransaction(row);
                setShowProcessingModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-all duration-200 border border-orange-300"
              title="Mark Processing Status"
            >
              <BookMarked className="w-3.5 h-3.5" />
            </button>

            {row.process_status === "fail" && (
              <button
                onClick={() => {
                  setSelectedBotRetryTransaction(row);
                  setShowBotRetryModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-all duration-200 border border-purple-300"
                title="Bot Retry"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Tombol Resend Callback - Hanya untuk status paid atau expired */}
            {(row.status === "paid" || row.status === "expire") && (
              <button
                onClick={() => {
                  setSelectedResendTransaction(row);
                  setShowResendModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-all duration-200 border border-blue-300"
                title="Resend Callback"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() =>
                router.push(`/transaction/detail/${row.transaction_uuid}`)
              }
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-all duration-200 border border-indigo-300"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      },
    ],
    [router, copiedId],
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Filter Section */}
      <TransactionFilter
        onApplyFilters={handleApplyFilters}
        onDownloadClick={() => setShowDownloadModal(true)}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={handleToggleAutoRefresh}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Transaction List"
          description="Complete list of all transactions with their status and details"
          columns={transactionColumns}
          data={transactions}
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
                  No transaction data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />

      <ProcessingStatusModal
        isOpen={showProcessingModal}
        onClose={() => {
          setShowProcessingModal(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleUpdateProcessingStatus}
        loading={processingLoading}
        transactionId={selectedTransaction?.transaction_uuid || ""}
      />

      <ResendCallbackModal
        isOpen={showResendModal}
        onClose={() => {
          setShowResendModal(false);
          setSelectedResendTransaction(null);
        }}
        onConfirm={handleResendCallback}
        loading={resendLoading}
        transactionId={selectedResendTransaction?.transaction_uuid || ""}
      />

      <BotRetryModal
        isOpen={showBotRetryModal}
        onClose={() => {
          setShowBotRetryModal(false);
          setSelectedBotRetryTransaction(null);
        }}
        onConfirm={handleBotRetry}
        loading={botRetryLoading}
        transactionId={selectedBotRetryTransaction?.transaction_uuid || ""}
      />
    </div>
  );
};

export default withRoleProtection(TransactionPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
  "StaffFinance",
]);
