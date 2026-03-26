// app/merchant/bank/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Eye, Check, X, CreditCard } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BankMerchant, BankMerchantQueryParams } from "@/types/bank-merchant";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { bankMerchantService } from "@/services/bank-merchant.service";
import { BankMerchantFilter } from "@/components/merchant/bank/MerchantBankFilter";
import { AcceptRejectModal } from "@/components/merchant/bank/AcceptRejectModal";
import { BankMerchantDetailModal } from "@/components/merchant/bank/BankMerchantDetailModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { BankMerchantBulkActions } from "@/components/merchant/bank/BankMerchantBulkActions";

const ListBankMerchantPage = () => {
  usePageTitle("Bank Merchant List");
  const router = useRouter();
  const [bankMerchants, setBankMerchants] = useState<BankMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<BankMerchantQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBankMerchantForDetail, setSelectedBankMerchantForDetail] =
    useState<BankMerchant | null>(null);

  // Accept/Reject Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "reject" | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<BankMerchant | null>(
    null,
  );
  const [reason, setReason] = useState("");

  const fetchBankMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bankMerchantService.getBankMerchants(filters);

      setBankMerchants(Array.isArray(response.data) ? response.data : []);

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
      setBankMerchants([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBankMerchants();
  }, [fetchBankMerchants]);

  const handleApplyFilters = (newFilters: BankMerchantQueryParams) => {
    const isClearing =
      !newFilters.search &&
      (!newFilters.status || newFilters.status === "all") &&
      (!newFilters.merchant_id || newFilters.merchant_id === "all") &&
      (!newFilters.agent_id || newFilters.agent_id === "all");

    if (isClearing) {
      setFilters({
        page: 1,
        limit: newFilters.limit || 10,
      });
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
  const openDetailModal = (bankMerchant: BankMerchant) => {
    setSelectedBankMerchantForDetail(bankMerchant);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedBankMerchantForDetail(null);
  };

  // Accept/Reject Modal Handlers
  const openModal = (merchant: BankMerchant, type: "accept" | "reject") => {
    setSelectedMerchant(merchant);
    setModalType(type);
    setReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMerchant(null);
    setModalType(null);
    setReason("");
  };

  const handleAccept = async () => {
    if (!selectedMerchant || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setActionLoading(true);
      const updatedMerchant = await bankMerchantService.acceptBankMerchant(
        selectedMerchant.bank_merchant_id,
        reason.trim(),
      );

      setBankMerchants((prev) =>
        prev.map((merchant) =>
          merchant.bank_merchant_id === selectedMerchant.bank_merchant_id
            ? updatedMerchant
            : merchant,
        ),
      );
      toast.success("Bank merchant accepted successfully");
      closeModal();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedMerchant || !reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const updatedMerchant = await bankMerchantService.rejectBankMerchant(
        selectedMerchant.bank_merchant_id,
        reason.trim(),
      );

      setBankMerchants((prev) =>
        prev.map((merchant) =>
          merchant.bank_merchant_id === selectedMerchant.bank_merchant_id
            ? updatedMerchant
            : merchant,
        ),
      );
      toast.success("Bank merchant rejected successfully");
      closeModal();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
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

  const bankMerchantColumns: TableColumn<BankMerchant>[] = useMemo(
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
        name: "Merchant Name",
        selector: (row) => row.merchant_name,
        sortable: true,
      },
      {
        name: "Account Name",
        selector: (row) => row.account_name,
        sortable: true,
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
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium text-gray-800">{row.bank_name}</div>
              <div className="text-xs text-gray-500">{row.bank_code}</div>
            </div>
          </div>
        ),
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
                  disabled={actionLoading}
                  className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 rounded-lg transition-all duration-200 border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Accept"
                >
                  <Check className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openModal(row, "reject")}
                  disabled={actionLoading}
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
    [actionLoading],
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <BankMerchantFilter onApplyFilters={handleApplyFilters} />

      <BankMerchantBulkActions onSuccess={fetchBankMerchants} />

      <div className="w-full">
        <CustomDataTable
          title="Bank Merchant List"
          description="All merchant bank accounts with their status and information"
          columns={bankMerchantColumns}
          data={bankMerchants}
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
                <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">
                  No bank merchant data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <BankMerchantDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        bankMerchant={selectedBankMerchantForDetail}
      />

      {/* Accept/Reject Modal */}
      <AcceptRejectModal
        isOpen={showModal}
        type={modalType}
        merchant={selectedMerchant}
        reason={reason}
        isLoading={actionLoading}
        onReasonChange={setReason}
        onConfirm={modalType === "accept" ? handleAccept : handleReject}
        onClose={closeModal}
      />
    </div>
  );
};

export default withRoleProtection(ListBankMerchantPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
  "StaffEntry",
]);
