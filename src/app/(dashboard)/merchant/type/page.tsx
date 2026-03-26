// app/merchant/type/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { merchantTypeService } from "@/services/merchant-type.service";
import { MerchantType, MerchantTypeQueryParams } from "@/types/merchant-type";
import { Edit, Trash2, Eye, Tag } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MerchantTypeFilter } from "@/components/merchant/type/MerchantTypeFilter";
import { DeleteConfirmationModal } from "@/components/merchant/type/DeleteConfirmationModal";
import { EditMerchantTypeModal } from "@/components/merchant/type/EditMerchantTypeModal";
import { MerchantTypeDetailModal } from "@/components/merchant/type/MerchantTypeDetailModal";
import { getErrorMessage } from "@/lib/utils";

const MerchantTypeListPage = () => {
  usePageTitle("Merchant Types");
  const router = useRouter();
  const [merchantTypes, setMerchantTypes] = useState<MerchantType[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<MerchantTypeQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMerchantTypeForDetail, setSelectedMerchantTypeForDetail] =
    useState<MerchantType | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    merchantType: null as MerchantType | null,
    isDeleting: false,
  });

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMerchantType, setSelectedMerchantType] =
    useState<MerchantType | null>(null);

  const fetchMerchantTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await merchantTypeService.getMerchantTypes(filters);

      setMerchantTypes(Array.isArray(response.data) ? response.data : []);

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
      setMerchantTypes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMerchantTypes();
  }, [fetchMerchantTypes]);

  const handleApplyFilters = (newFilters: MerchantTypeQueryParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  const handleOpenCreate = () => {
    router.push("/merchant/type/create");
  };

  // Detail Modal Handlers
  const openDetailModal = (merchantType: MerchantType) => {
    setSelectedMerchantTypeForDetail(merchantType);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedMerchantTypeForDetail(null);
  };

  // Edit Modal Handlers
  const openEditModal = (merchantType: MerchantType) => {
    setSelectedMerchantType(merchantType);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMerchantType(null);
  };

  const handleEditSuccess = useCallback(() => {
    fetchMerchantTypes();
  }, [fetchMerchantTypes]);

  // Delete Modal Handlers
  const openDeleteModal = (merchantType: MerchantType) => {
    setDeleteModal({
      isOpen: true,
      merchantType,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        merchantType: null,
        isDeleting: false,
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.merchantType) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await merchantTypeService.deleteMerchantType(
        deleteModal.merchantType.merchant_type_id
      );
      toast.success("Merchant type deleted successfully");
      fetchMerchantTypes();
      closeDeleteModal();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const merchantTypeColumns: TableColumn<MerchantType>[] = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Transaction Range",
        selector: (row) => row.minimum,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(row.minimum)} - {formatCurrency(row.maximum)}
              </span>
            </div>
          </div>
        ),
      },
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
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDetailModal(row)}
              className="bg-green-500/10 hover:bg-green-500/20 border-green-200 text-green-700"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(row)}
              className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
              title="Edit type"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openDeleteModal(row)}
              className="bg-red-500/10 hover:bg-red-500/20 border-red-200 text-red-700"
              title="Delete type"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Filters */}
      <MerchantTypeFilter
        onApplyFilters={handleApplyFilters}
        onOpenCreate={handleOpenCreate}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Merchant Type Management"
          description="Manage merchant types and their transaction limits"
          columns={merchantTypeColumns}
          data={merchantTypes}
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
                <Tag className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">
                  No merchant types found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Create your first merchant type to get started
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <MerchantTypeDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        merchantType={selectedMerchantTypeForDetail}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Merchant Type"
        description={
          deleteModal.merchantType
            ? `Are you sure you want to delete "${deleteModal.merchantType.name}"? This action cannot be undone and will permanently remove this merchant type from the system.`
            : undefined
        }
        itemName={deleteModal.merchantType?.name}
        isDeleting={deleteModal.isDeleting}
        confirmText="Delete Type"
      />

      {/* Edit Merchant Type Modal */}
      <EditMerchantTypeModal
        isOpen={editModalOpen}
        merchantType={selectedMerchantType}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default withRoleProtection(MerchantTypeListPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);