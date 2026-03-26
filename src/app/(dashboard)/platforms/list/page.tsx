// app/platforms/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import { toast } from "sonner";
import CustomDataTable from "@/components/CustomDataTable";
import { Eye, Plus, Trash2, Edit } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Platform, PlatformQueryParams } from "@/types/platform";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { platformService } from "@/services/platform.service";
import { PlatformFilter } from "@/components/platform/PlatformFilter";
import { EditPlatformModal } from "@/components/platform/EditPlatformModal";
import { DeletePlatformModal } from "@/components/platform/DeletePlatformModal";
import { PlatformDetailModal } from "@/components/platform/PlatformDetailModal";
import { getErrorMessage } from "@/lib/utils";

const ListPlatformPage = () => {
  usePageTitle("Platform List");
  const router = useRouter();

  // Data states
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<PlatformQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPlatformForDetail, setSelectedPlatformForDetail] =
    useState<Platform | null>(null);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    platformId: null as string | null,
    platformName: null as string | null,
    isDeleting: false,
  });

  const [editModal, setEditModal] = useState({
    isOpen: false,
    platform: null as Platform | null,
  });

  // Fetch platforms
  const fetchPlatforms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await platformService.getPlatforms(filters);

      setPlatforms(Array.isArray(response.data) ? response.data : []);

      // Set pagination dari metadata
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
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  // Filter handlers
  const handleApplyFilters = (newFilters: PlatformQueryParams) => {
    // Replace filters completely instead of merging to ensure clear works properly
    setFilters({ ...newFilters });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (platform: Platform) => {
    setSelectedPlatformForDetail(platform);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPlatformForDetail(null);
  };

  // Delete handlers
  const openDeleteModal = (platformId: string, platformName: string) => {
    setDeleteModal({
      isOpen: true,
      platformId,
      platformName,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      platformId: null,
      platformName: null,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.platformId) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await platformService.deletePlatform(deleteModal.platformId);

      toast.success("Platform deleted successfully", {
        description: `${deleteModal.platformName} has been removed`,
      });

      fetchPlatforms();
      closeDeleteModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Edit handlers
  const openEditModal = (platform: Platform) => {
    setEditModal({
      isOpen: true,
      platform,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      platform: null,
    });
  };

  const handleEditSuccess = () => {
    toast.success("Platform updated successfully", {
      description: "Changes have been saved",
    });
    fetchPlatforms();
    closeEditModal();
  };

  // Utility functions
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      ACTIVE: "text-green-700",
      PENDING: "text-yellow-700",
      INACTIVE: "text-red-700",
    };
    return colors[status] || "text-gray-700";
  };

  // Table columns
  const platformColumns: TableColumn<Platform>[] = useMemo(
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
        name: "Platform Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Partner",
        selector: (row) => row.partner_name,
        sortable: true,
      },
      {
        name: "Referral Code",
        selector: (row) => row.referral,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {row.referral}
            </span>
          </div>
        ),
      },
      {
        name: "Fee",
        selector: (row) => row.fee,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{row.fee}%</span>
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
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-all duration-200 border border-blue-500/30"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => openEditModal(row)}
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 rounded-lg transition-all duration-200 border border-amber-500/30"
              title="Edit platform"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => openDeleteModal(row.platform_id, row.name)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 rounded-lg transition-all duration-200 border border-red-500/30"
              title="Delete platform"
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
      {/* Filter Component */}
      <PlatformFilter onApplyFilters={handleApplyFilters} />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Platform List"
          description="All registered platforms with their status and information"
          columns={platformColumns}
          data={platforms}
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-4">
                  No platforms found
                </p>
                <button
                  onClick={() => router.push("/platforms/create")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Create First Platform
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <PlatformDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        platform={selectedPlatformForDetail}
      />

      {/* Delete Modal */}
      <DeletePlatformModal
        isOpen={deleteModal.isOpen}
        platformName={deleteModal.platformName}
        isDeleting={deleteModal.isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />

      {/* Edit Modal */}
      <EditPlatformModal
        isOpen={editModal.isOpen}
        platform={editModal.platform}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default withRoleProtection(ListPlatformPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);