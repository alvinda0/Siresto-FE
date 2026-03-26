// app/merchant/list/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { ActionCard, ActionButton } from "@/components/merchant/ActionCard";
import {
  Eye,
  Server,
  User,
  Edit,
  Plus,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Merchant, MerchantQueryParams } from "@/types/merchant";
import { MerchantFilter } from "@/components/merchant/MerchantFilter";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { merchantService } from "@/services/merchant.service";
import { EditMerchantModal } from "@/components/merchant/EditMerchantModal";
import { DeleteMerchantModal } from "@/components/merchant/DeleteMerchantModal";
import { BulkUploadModal } from "@/components/merchant/BulkUploadModal";
import { BulkAssignMerchantModal } from "@/components/merchant/BulkAssignMerchantModal";
import { MerchantDetailModal } from "@/components/merchant/MerchantDetailModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const ListMerchantPage = () => {
  usePageTitle("Merchant List");
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<MerchantQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMerchantForDetail, setSelectedMerchantForDetail] =
    useState<Merchant | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    merchantId: null as string | null,
    merchantName: null as string | null,
    isDeleting: false,
  });

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(
    null
  );

  // Bulk Upload State
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Bulk Assign State
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchMerchants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchants(filters);

      setMerchants(Array.isArray(response.data) ? response.data : []);

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
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const handleApplyFilters = (newFilters: MerchantQueryParams) => {
    // Force create new object untuk trigger useEffect
    setFilters({ ...newFilters });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (merchant: Merchant) => {
    setSelectedMerchantForDetail(merchant);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedMerchantForDetail(null);
  };

  // Delete Modal Handlers
  const openDeleteModal = (merchantId: string, merchantName: string) => {
    setDeleteModal({
      isOpen: true,
      merchantId,
      merchantName,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      merchantId: null,
      merchantName: null,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.merchantId) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await merchantService.deleteMerchant(deleteModal.merchantId);
      toast.success("Merchant deleted successfully");
      fetchMerchants();
      closeDeleteModal();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Edit Modal Handlers
  const openEditModal = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMerchant(null);
  };

  const handleEditSuccess = () => {
    toast.success("Merchant updated successfully");
    fetchMerchants();
    closeEditModal();
  };

  // Download Template Handler
  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await merchantService.downloadTemplate();
      toast.success("Template downloaded successfully");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  // Bulk Upload Handlers
  const handleOpenBulkUploadModal = () => {
    setBulkUploadModalOpen(true);
    setSelectedFile(null);
  };

  const handleCloseBulkUploadModal = () => {
    setBulkUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      setIsUploading(true);
      const result = await merchantService.bulkUploadMerchants(selectedFile);
      const successMsg = result.message || "Merchants uploaded successfully";
      toast.success(successMsg);
      handleCloseBulkUploadModal();
      fetchMerchants();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Bulk Assign Handlers
  const handleOpenBulkAssignModal = () => {
    setBulkAssignModalOpen(true);
  };

  const handleCloseBulkAssignModal = () => {
    setBulkAssignModalOpen(false);
  };

  const handleBulkAssign = async (selectedIds: string[], agentId: string) => {
    try {
      setIsAssigning(true);
      const result = await merchantService.bulkAssignMerchants(
        selectedIds,
        agentId
      );
      const successMsg =
        result.message ||
        `${selectedIds.length} merchants assigned successfully`;
      toast.success(successMsg);
      handleCloseBulkAssignModal();
      fetchMerchants();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCreateMerchant = () => {
    router.push("/merchant/create");
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      ACTIVE: "text-green-700",
      PENDING: "text-yellow-700",
      INACTIVE: "text-red-700",
    };
    return colors[status] || "text-gray-700";
  };

  const getEnvironmentColor = (environment: string): string => {
    const colors: { [key: string]: string } = {
      LIVE: "text-blue-700",
      DEVELOPMENT: "text-purple-700",
    };
    return colors[environment] || "text-gray-700";
  };

  // Action Buttons Configuration
  const actionButtons: ActionButton[] = useMemo(
    () => [
      {
        label: "Download Template",
        mobileLabel: "Template",
        icon: <Download className="w-4 h-4" />,
        onClick: handleDownloadTemplate,
        variant: "success",
        disabled: isDownloading,
        loading: isDownloading,
        loadingText: "Downloading...",
      },
      {
        label: "Bulk Create",
        mobileLabel: "Bulk",
        icon: <Upload className="w-4 h-4" />,
        onClick: handleOpenBulkUploadModal,
        variant: "warning",
      },
      {
        label: "Bulk Assign",
        mobileLabel: "Assign",
        icon: <User className="w-4 h-4" />,
        onClick: handleOpenBulkAssignModal,
        variant: "info",
      },
      {
        label: "Create Merchant",
        mobileLabel: "Create",
        icon: <Plus className="w-4 h-4" />,
        onClick: handleCreateMerchant,
        variant: "primary",
      },
    ],
    [isDownloading]
  );

  const merchantColumns: TableColumn<Merchant>[] = useMemo(
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
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "External ID",
        selector: (row) => row.external_id || "-",
        sortable: true,
      },
      {
        name: "Vendor",
        selector: (row) => row.vendor_name,
        sortable: true,
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name,
        sortable: true,
      },
      {
        name: "Type",
        selector: (row) => row.merchant_type_name,
        sortable: true,
      },
      {
        name: "Environment",
        selector: (row) => row.environment,
        sortable: true,
        cell: (row) => (
          <span
            className={`text-xs font-bold ${getEnvironmentColor(
              row.environment
            )}`}
          >
            {row.environment}
          </span>
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
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => openEditModal(row)}
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 rounded-lg transition-all duration-200 border border-amber-500/30"
              title="Edit merchant"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => openDeleteModal(row.merchant_id, row.name)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-all duration-200 border border-red-500/30"
              title="Delete merchant"
            >
              <Trash2 className="w-4 h-4" />
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
      <MerchantFilter onApplyFilters={handleApplyFilters} />

      {/* Action Buttons Card */}
      <ActionCard actions={actionButtons} />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Merchant List"
          description="All system merchants with their status and information"
          columns={merchantColumns}
          data={merchants}
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
                <Server className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">No merchants found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Modals */}
      <MerchantDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        merchant={selectedMerchantForDetail}
      />

      <DeleteMerchantModal
        isOpen={deleteModal.isOpen}
        merchantName={deleteModal.merchantName}
        isDeleting={deleteModal.isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={closeDeleteModal}
      />

      <EditMerchantModal
        isOpen={editModalOpen}
        merchant={selectedMerchant}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        selectedFile={selectedFile}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleBulkUpload}
        onClose={handleCloseBulkUploadModal}
      />

      <BulkAssignMerchantModal
        isOpen={bulkAssignModalOpen}
        onClose={handleCloseBulkAssignModal}
        onSubmit={handleBulkAssign}
        isLoading={isAssigning}
        defaultAgentId="62a63cf1-3926-4c28-aa1f-47879292bca0"
      />
    </div>
  );
};

export default withRoleProtection(ListMerchantPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
