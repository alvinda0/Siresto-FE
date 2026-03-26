// app/disbursement-platform-idr/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { disbursementPlatformService } from "@/services/disbursement-platform.service";
import {
  DisbursementPlatform,
  DisbursementPlatformQueryParams,
  DisbursementPlatformSummary,
  DisbursementPlatformTotal,
} from "@/types/disbursement-platform";
import { Check, CheckCircle, Copy, Eye, Upload, X } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { ApproveDialog } from "@/components/disburement-platform/ApproveDialog";
import { RejectDialog } from "@/components/disburement-platform/RejectDialog";
import { ProcessingDialog } from "@/components/disburement-platform/ProcessingDialog";
import { UploadProofDialog } from "@/components/disburement-platform/UploadProofDialog";
import { DisbursementPlatformBulkActions } from "@/components/disburement-platform/DisbursementPlatformBulkActions";
import { BulkApproveDialog } from "@/components/disburement-platform/BulkApproveDialog";
import { BulkRejectDialog } from "@/components/disburement-platform/BulkRejectDialog";
import { BulkProcessingDialog } from "@/components/disburement-platform/BulkProcessingDialog";
import { DisbursementPlatformStatisticsCard } from "@/components/disburement-platform/DisbursementPlatformStatisticsCard";
import { DisbursementPlatformFilter } from "@/components/disburement-platform/DisbursementPlatformFilter";
import { ExportDisbursementPlatformModal } from "@/components/disburement-platform/ExportDisbursementPlatformModal";

const ListDisbursementPlatformIdrPage = () => {
  usePageTitle("Disbursement Platform IDR");
  const router = useRouter();

  const [disbursements, setDisbursements] = useState<DisbursementPlatform[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [summary, setSummary] = useState<DisbursementPlatformSummary[]>([]);
  const [total, setTotal] = useState<DisbursementPlatformTotal | null>(null);

  const [selectedDisbursement, setSelectedDisbursement] =
    useState<DisbursementPlatform | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const [showUploadProofDialog, setShowUploadProofDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [showBulkApproveDialog, setShowBulkApproveDialog] = useState(false);
  const [showBulkRejectDialog, setShowBulkRejectDialog] = useState(false);
  const [showBulkProcessingDialog, setShowBulkProcessingDialog] =
    useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<DisbursementPlatformQueryParams>({
    page: 1,
    limit: 10,
    type: "IDR",
  });

  const fetchDisbursements = useCallback(async () => {
    try {
      setLoading(true);
      const response =
        await disbursementPlatformService.getDisbursementPlatforms(filters);

      setDisbursements(Array.isArray(response.data) ? response.data : []);

      if (response.metadata) {
        setPagination({
          total: response.metadata.total,
          totalPages: response.metadata.total_pages,
          currentPage: response.metadata.page,
          limit: response.metadata.limit,
        });
      }

      if (response.summary) {
        setSummary(response.summary);
      }

      if (response.total) {
        setTotal(response.total);
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setDisbursements([]);
      setSummary([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDisbursements();
  }, [fetchDisbursements]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleApplyFilters = (newFilters: DisbursementPlatformQueryParams) => {
    const isClearOperation =
      Object.keys(newFilters).length === 3 &&
      newFilters.page === 1 &&
      newFilters.limit === 10 &&
      newFilters.type === "IDR";

    if (isClearOperation) {
      setFilters({ page: 1, limit: 10, type: "IDR" });
    } else {
      setFilters((prev) => ({ ...prev, ...newFilters, page: 1, type: "IDR" }));
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleApprove = (disbursement: DisbursementPlatform) => {
    setSelectedDisbursement(disbursement);
    setShowApproveDialog(true);
  };

  const handleReject = (disbursement: DisbursementPlatform) => {
    setSelectedDisbursement(disbursement);
    setShowRejectDialog(true);
  };

  const handleProcessing = (disbursement: DisbursementPlatform) => {
    setSelectedDisbursement(disbursement);
    setShowProcessingDialog(true);
  };

  const handleUploadProof = (disbursement: DisbursementPlatform) => {
    setSelectedDisbursement(disbursement);
    setShowUploadProofDialog(true);
  };

  // Handler untuk approve confirmation
  const handleApproveConfirm = async (formData: FormData) => {
    if (!selectedDisbursement) return;

    try {
      setActionLoading(true);
      await disbursementPlatformService.approveDisbursement(
        selectedDisbursement.disbursement_id,
        formData
      );
      toast.success("Disbursement approved successfully");
      setShowApproveDialog(false);
      setSelectedDisbursement(null);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler untuk reject confirmation
  const handleRejectConfirm = async (reason: string) => {
    if (!selectedDisbursement) return;

    try {
      setActionLoading(true);
      await disbursementPlatformService.rejectDisbursement(
        selectedDisbursement.disbursement_id,
        reason
      );
      toast.success("Disbursement rejected successfully");
      setShowRejectDialog(false);
      setSelectedDisbursement(null);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler untuk processing confirmation
  const handleProcessingConfirm = async () => {
    if (!selectedDisbursement) return;

    try {
      setActionLoading(true);
      await disbursementPlatformService.processingDisbursement(
        selectedDisbursement.disbursement_id
      );
      toast.success("Disbursement moved to processing successfully");
      setShowProcessingDialog(false);
      setSelectedDisbursement(null);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Handler untuk upload proof confirmation
  const handleUploadProofConfirm = async (formData: FormData) => {
    if (!selectedDisbursement) return;

    try {
      setActionLoading(true);
      await disbursementPlatformService.uploadProof(
        selectedDisbursement.disbursement_id,
        formData
      );
      toast.success("Proof uploaded successfully");
      setShowUploadProofDialog(false);
      setSelectedDisbursement(null);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Approve Handler
  const handleBulkApprove = () => {
    setShowBulkApproveDialog(true);
  };

  // Handler untuk bulk approve confirmation
  const handleBulkApproveConfirm = async (
    disbursementIds: string[],
    reason: string,
    pin: string
  ) => {
    try {
      setBulkActionLoading(true);
      const response =
        await disbursementPlatformService.bulkApproveDisbursementsWithIds({
          disbursement_ids: disbursementIds,
          reason,
          pin,
        });

      toast.success(
        `Successfully approved ${response.data.approved_count} disbursements`
      );

      setShowBulkApproveDialog(false);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Reject Handler
  const handleBulkReject = () => {
    setShowBulkRejectDialog(true);
  };

  const handleBulkRejectConfirm = async (
    disbursementIds: string[],
    reason: string
  ) => {
    try {
      setBulkActionLoading(true);
      const response =
        await disbursementPlatformService.bulkRejectDisbursements({
          disbursement_ids: disbursementIds,
          reason,
        });

      toast.success(
        `Successfully rejected ${response.data.rejected_count} disbursements`
      );

      setShowBulkRejectDialog(false);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Bulk Processing Handler
  const handleBulkProcessing = () => {
    setShowBulkProcessingDialog(true);
  };

  const handleBulkProcessingConfirm = async (disbursementIds: string[]) => {
    try {
      setBulkActionLoading(true);
      const response =
        await disbursementPlatformService.bulkProcessingDisbursements({
          disbursement_ids: disbursementIds,
        });

      toast.success(
        `Successfully moved ${response.data.processing_count} disbursements to processing`
      );

      setShowBulkProcessingDialog(false);
      fetchDisbursements();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      PENDING: "text-yellow-700",
      PROCESSING: "text-blue-700",
      APPROVED: "text-green-700",
      REJECTED: "text-red-700",
      MANUAL: "text-purple-700",
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

  const disbursementColumns: TableColumn<DisbursementPlatform>[] = useMemo(
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
        name: "Disbursement ID",
        selector: (row) => row.disbursement_id,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2 group">
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium text-slate-700 truncate max-w-[140px]"
                title={row.disbursement_id}
              >
                {row.disbursement_id}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.disbursement_id, row.disbursement_id);
              }}
              className="p-1.5 rounded-lg bg-white/50 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100 border border-blue-500/20 hover:border-blue-500/40"
              title="Copy Disbursement ID"
            >
              {copiedId === row.disbursement_id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              )}
            </button>
          </div>
        ),
      },
      {
        name: "Platform ID",
        selector: (row) => row.platform_id,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2 group">
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium text-slate-700 truncate max-w-[140px]"
                title={row.platform_id}
              >
                {row.platform_id}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(row.platform_id, row.platform_id);
              }}
              className="p-1.5 rounded-lg bg-white/50 hover:bg-blue-500/10 transition-all opacity-0 group-hover:opacity-100 border border-blue-500/20 hover:border-blue-500/40"
              title="Copy Platform ID"
            >
              {copiedId === row.platform_id ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-blue-600" />
              )}
            </button>
          </div>
        ),
      },
      {
        name: "Platform Name",
        selector: (row) => row.platform_name,
        sortable: false,
        width: "180px",
        cell: (row) => (
          <div className="text-sm font-semibold text-indigo-700">
            {row.platform_name}
          </div>
        ),
      },
      {
        name: "Bank Info",
        selector: (row) => row.bank_name,
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div>
            <div className="text-sm font-medium text-slate-700">
              {row.bank_name}
            </div>
            <div className="text-xs text-gray-500">{row.account_name}</div>
          </div>
        ),
      },
      {
        name: "Account Number",
        selector: (row) => row.account_number,
        sortable: false,
        width: "150px",
        cell: (row) => (
          <div className="text-sm font-medium">{row.account_number}</div>
        ),
      },
      {
        name: "Amount",
        selector: (row) => row.amount,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <div className="text-sm font-semibold">
            {formatCurrency(row.amount)}
          </div>
        ),
      },
      {
        name: "Admin Cost",
        selector: (row) => row.admin_cost,
        sortable: false,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600">
            {formatCurrency(row.admin_cost)}
          </div>
        ),
      },
      {
        name: "Total",
        selector: (row) => row.total_disbursements,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <div className="text-sm font-bold text-green-700">
            {formatCurrency(row.total_disbursements)}
          </div>
        ),
      },
      {
        name: "Before Wallet",
        selector: (row) => row.before_wallet || 0,
        sortable: false,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600">
            {formatCurrency(row.before_wallet || 0)}
          </div>
        ),
      },
      {
        name: "After Wallet",
        selector: (row) => row.after_wallet || 0,
        sortable: false,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600">
            {formatCurrency(row.after_wallet || 0)}
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: false,
        width: "130px",
        cell: (row) => (
          <span
            className={`text-xs font-bold uppercase ${getStatusColor(
              row.status
            )}`}
          >
            {row.status}
          </span>
        ),
      },
      {
        name: "Processed By",
        selector: (row) => row.process_by_name || "-",
        sortable: false,
      },
      {
        name: "Proof",
        selector: (row) => row.file_url || "",
        sortable: false,
        width: "100px",
        cell: (row) => {
          if (row.file_url) {
            return (
              <a
                href={row.file_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-xs font-medium"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View
              </a>
            );
          }
          return <span className="text-xs text-gray-400 italic">No file</span>;
        },
      },
      {
        name: "Reason",
        selector: (row) => row.reason || "-",
        sortable: false,
        width: "200px",
        cell: (row) => (
          <div className="text-sm text-gray-600">
            {row.reason ? row.reason : <span className="italic">-</span>}
          </div>
        ),
      },
      {
        name: "Actions",
        width: "260px",
        cell: (row) => {
          const isPending = row.status === "PENDING";
          const isProcessing = row.status === "PROCESSING";
          const isManual = row.status === "MANUAL";
          const canApproveReject = isPending || isProcessing || isManual;
          const canProcess = isPending;

          return (
            <div className="flex items-center gap-2">
              {canProcess && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProcessing(row);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-all duration-200 border border-blue-300 text-xs font-medium"
                  title="Move to Processing"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </button>
              )}

              {isManual && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUploadProof(row);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg transition-all duration-200 border border-purple-300 text-xs font-medium"
                  title="Upload Proof"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              )}

              {canApproveReject && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApprove(row);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-all duration-200 border border-green-300 text-xs font-medium"
                    title="Approve"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(row);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-all duration-200 border border-red-300 text-xs font-medium"
                    title="Reject"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/disbursement/idr/platform/detail/${row.disbursement_id}`
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-all duration-200 border border-indigo-300 text-xs font-medium"
                title="View Detail"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      },
    ],
    [router, copiedId]
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Statistics Cards */}
      <DisbursementPlatformStatisticsCard
        summary={summary}
        total={total}
        loading={loading}
      />

      {/* Filter Section */}
      <DisbursementPlatformFilter
        onApplyFilters={handleApplyFilters}
        onExport={handleExport}
      />
      <DisbursementPlatformBulkActions
        onBulkApprove={handleBulkApprove}
        onBulkReject={handleBulkReject}
        onBulkProcessing={handleBulkProcessing}
      />
      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Disbursement Platform IDR"
          description="List of all IDR disbursements to platforms"
          columns={disbursementColumns}
          data={disbursements}
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
                  No disbursement data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      <ApproveDialog
        isOpen={showApproveDialog}
        onClose={() => {
          setShowApproveDialog(false);
          setSelectedDisbursement(null);
        }}
        onConfirm={handleApproveConfirm}
        disbursementId={selectedDisbursement?.disbursement_id || ""}
        platformName={selectedDisbursement?.platform_name || ""}
        isLoading={actionLoading}
      />

      <RejectDialog
        isOpen={showRejectDialog}
        onClose={() => {
          setShowRejectDialog(false);
          setSelectedDisbursement(null);
        }}
        onConfirm={handleRejectConfirm}
        disbursementId={selectedDisbursement?.disbursement_id || ""}
        platformName={selectedDisbursement?.platform_name || ""}
        isLoading={actionLoading}
      />

      <ProcessingDialog
        isOpen={showProcessingDialog}
        onClose={() => {
          setShowProcessingDialog(false);
          setSelectedDisbursement(null);
        }}
        onConfirm={handleProcessingConfirm}
        disbursementId={selectedDisbursement?.disbursement_id || ""}
        platformName={selectedDisbursement?.platform_name || ""}
        amount={selectedDisbursement?.total_disbursements || 0}
        isLoading={actionLoading}
      />

      <UploadProofDialog
        isOpen={showUploadProofDialog}
        onClose={() => {
          setShowUploadProofDialog(false);
          setSelectedDisbursement(null);
        }}
        onConfirm={handleUploadProofConfirm}
        disbursementId={selectedDisbursement?.disbursement_id || ""}
        platformName={selectedDisbursement?.platform_name || ""}
        isLoading={actionLoading}
      />

      <BulkApproveDialog
        isOpen={showBulkApproveDialog}
        onClose={() => setShowBulkApproveDialog(false)}
        onConfirm={handleBulkApproveConfirm}
        isLoading={bulkActionLoading}
        type="IDR"
      />

      <BulkRejectDialog
        isOpen={showBulkRejectDialog}
        onClose={() => setShowBulkRejectDialog(false)}
        onConfirm={handleBulkRejectConfirm}
        isLoading={bulkActionLoading}
        type="IDR"
      />

      <BulkProcessingDialog
        isOpen={showBulkProcessingDialog}
        onClose={() => setShowBulkProcessingDialog(false)}
        onConfirm={handleBulkProcessingConfirm}
        isLoading={bulkActionLoading}
        type="IDR"
      />

      <ExportDisbursementPlatformModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        type="IDR"
      />
    </div>
  );
};

export default withRoleProtection(ListDisbursementPlatformIdrPage, [
  "Superuser",
  "Supervisor",
]);