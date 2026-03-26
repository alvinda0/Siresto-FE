// app/(dashboard)/merchant/requests/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { ActionCard, ActionButton } from "@/components/merchant/ActionCard";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MerchantRequest, MerchantRequestQueryParams } from "@/types/merchantRequest";
import { MerchantRequestFilter } from "@/components/merchant/MerchantRequestFilter";
import { MerchantRequestDetailModal } from "@/components/merchant/MerchantRequestDetailModal";
import { MerchantRequestRejectModal } from "@/components/merchant/MerchantRequestRejectModal";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { merchantRequestService } from "@/services/merchantRequest.service";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const MerchantRequestsPage = () => {
  usePageTitle("Merchant Requests");
  
  const [requests, setRequests] = useState<MerchantRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<MerchantRequest | null>(null);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestForReject, setSelectedRequestForReject] = useState<MerchantRequest | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<MerchantRequestQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await merchantRequestService.getMerchantRequests(filters);

      setRequests(Array.isArray(response.data) ? response.data : []);

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
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleApplyFilters = (newFilters: MerchantRequestQueryParams) => {
    setFilters({ ...newFilters });
  };

  const handleClearFilters = () => {
    const clearedFilters: MerchantRequestQueryParams = {
      page: 1,
      limit: 10,
    };
    setFilters(clearedFilters);
  };

  // Detail Modal Handlers
  const openDetailModal = (request: MerchantRequest) => {
    setSelectedRequestForDetail(request);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRequestForDetail(null);
  };

  // Reject Modal Handlers
  const openRejectModal = (request: MerchantRequest) => {
    setSelectedRequestForReject(request);
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedRequestForReject(null);
  };

  const handleApprove = async (requestId: string) => {
    try {
      await merchantRequestService.approveMerchantRequest(requestId);
      toast.success("Request approved successfully");
      fetchRequests();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      await merchantRequestService.rejectMerchantRequest(requestId, reason);
      toast.success("Request rejected successfully");
      fetchRequests();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (selectedRequestForReject) {
      await handleReject(selectedRequestForReject.id, reason);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      PENDING: "text-yellow-700 bg-yellow-100",
      APPROVED: "text-green-700 bg-green-100",
      REJECTED: "text-red-700 bg-red-100",
    };
    return colors[status] || "text-gray-700 bg-gray-100";
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      PENDING: <Clock className="w-4 h-4" />,
      APPROVED: <CheckCircle className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  // Action Buttons Configuration - Remove refresh button
  const actionButtons: ActionButton[] = useMemo(() => [], []);

  const requestColumns: TableColumn<MerchantRequest>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {new Date(row.created_at).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ),
      },
      {
        name: "Agent Name",
        selector: (row) => row.agent_name,
        sortable: true,
        cell: (row) => (
          <div className="font-medium text-gray-900">
            {row.agent_name}
          </div>
        ),
      },
      {
        name: "Requested Count",
        selector: (row) => row.requested_count,
        sortable: true,
        cell: (row) => (
          <div className="text-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {row.requested_count} merchants
            </span>
          </div>
        ),
      },
      {
        name: "Est. Daily Transactions",
        selector: (row) => row.estimated_daily_transactions,
        sortable: true,
        cell: (row) => (
          <div className="text-sm font-medium">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              minimumFractionDigits: 0,
            }).format(row.estimated_daily_transactions)}
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row) => row.status,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
              {getStatusIcon(row.status)}
              {row.status}
            </span>
          </div>
        ),
      },
      {
        name: "Reason",
        selector: (row) => row.reason || "-",
        cell: (row) => (
          <div className="max-w-xs">
            <span className="text-sm text-gray-600 truncate block">
              {row.reason || "-"}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            {row.status === "PENDING" && (
              <>
                <button
                  onClick={() => handleApprove(row.id)}
                  className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 rounded-lg transition-all duration-200 border border-green-500/30"
                  title="Approve request"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openRejectModal(row)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-all duration-200 border border-red-500/30"
                  title="Reject request"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={() => openDetailModal(row)}
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Filters */}
      <MerchantRequestFilter 
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Merchant Requests"
          description="Agent requests for new merchants with approval workflow"
          columns={requestColumns}
          data={requests}
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
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">No merchant requests found</p>
                <p className="text-sm text-gray-400 mt-1">
                  No pending or processed requests at the moment
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Modals */}
      <MerchantRequestDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        request={selectedRequestForDetail}
      />

      <MerchantRequestRejectModal
        isOpen={rejectModalOpen}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
        agentName={selectedRequestForReject?.agent_name}
      />
    </div>
  );
};

export default withRoleProtection(MerchantRequestsPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);