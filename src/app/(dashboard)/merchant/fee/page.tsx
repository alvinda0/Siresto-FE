// app/merchant/fee/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Eye, DollarSign, Edit } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Fee, FeeQueryParams } from "@/types/fee";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { feeService } from "@/services/fee.service";
import { FeeFilter } from "@/components/fee/FeeFilter";
import { EditFeeModal } from "@/components/fee/EditFeeModal";
import { FeeDetailModal } from "@/components/fee/FeeDetailModal";
import { useAuthMe } from "@/hooks/useAuthMe";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const ListFeePage = () => {
  usePageTitle("Fee List");
  const router = useRouter();
  const { data: user } = useAuthMe();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<FeeQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFeeForDetail, setSelectedFeeForDetail] = useState<Fee | null>(
    null
  );

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  const fetchFees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await feeService.getFees(filters);

      setFees(Array.isArray(response.data) ? response.data : []);

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
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleApplyFilters = (newFilters: FeeQueryParams) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (fee: Fee) => {
    setSelectedFeeForDetail(fee);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedFeeForDetail(null);
  };

  // Edit Modal Handlers
  const openEditModal = (fee: Fee) => {
    setSelectedFee(fee);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedFee(null);
  };

  const handleEditSuccess = useCallback(() => {
    toast.success("Fee updated successfully");
    fetchFees();
    closeEditModal();
  }, [fetchFees]);

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      ACTIVE: "text-green-700",
      PENDING: "text-yellow-700",
      INACTIVE: "text-red-700",
    };
    return colors[status] || "text-gray-700";
  };

  const feeColumns: TableColumn<Fee>[] = useMemo(
    () => [
      {
        name: "Agent Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "Agent Fee",
        selector: (row) => row.agent_fee,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-blue-600">
              {row.agent_fee.toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        name: "Platform Fee",
        selector: (row) => row.platform_fee,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-purple-600">
              {row.platform_fee.toFixed(1)}%
            </span>
          </div>
        ),
      },
      {
        name: "Total Fee",
        selector: (row) => row.total_fee,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-green-600">
              {row.total_fee.toFixed(2)}%
            </span>
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
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openDetailModal(row)}
              className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-700 rounded-lg transition-all duration-200 border border-green-500/30"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {user?.role_name !== "StaffFinance" && (
              <button
                onClick={() => openEditModal(row)}
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
                title="Edit fee"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [user]
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Filter Section */}
      <FeeFilter onApplyFilters={handleApplyFilters} />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Fee Management"
          description="Manage and view all agent fees with their platform information"
          columns={feeColumns}
          data={fees}
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
                <DollarSign className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">
                  No fee data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <FeeDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        fee={selectedFeeForDetail}
      />

      {/* Edit Fee Modal */}
      <EditFeeModal
        isOpen={editModalOpen}
        fee={selectedFee}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default withRoleProtection(ListFeePage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);