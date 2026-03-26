// app/announcement/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { announcementService } from "@/services/announcement.service";
import {
  Announcement,
  AnnouncementQueryParams,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "@/types/announcement";
import { Edit2, Trash2, Megaphone, Power } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { usePermission, withRoleProtection } from "@/components/ProtectedRoles";
import { Button } from "@/components/ui/button";
import { CreateAnnouncementModal } from "@/components/announcement/CreateAnnouncementModal";
import { EditAnnouncementModal } from "@/components/announcement/EditAnnouncementModal";
import { DeleteAnnouncementModal } from "@/components/announcement/DeleteAnnouncementModal";
import { toast } from "sonner";
import { AnnouncementFilter } from "@/components/announcement/AnnouncementFilter";
import { getErrorMessage } from "@/lib/utils";
import { get } from "http";

const AnnouncementListPage = () => {
  usePageTitle("Announcements");
  const canModify = usePermission(["Superuser", "Supervisor"]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<AnnouncementQueryParams>({
    page: 1,
    limit: 10,
  });

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements(filters);

      setAnnouncements(Array.isArray(response.data) ? response.data : []);

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
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handlePageChange = (page: number) => {
    setFilters((prev: AnnouncementQueryParams) => ({ ...prev, page }));
  };

  const handleApplyFilters = (newFilters: AnnouncementQueryParams) => {
    setFilters(newFilters);
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev: AnnouncementQueryParams) => ({
      ...prev,
      limit: newPerPage,
      page: 1,
    }));
  };

  // Create Handlers
  const handleCreateClose = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateSubmit = async (payload: CreateAnnouncementPayload) => {
    setCreateLoading(true);
    try {
      await announcementService.createAnnouncement(payload);
      toast.success("Announcement created successfully");
      fetchAnnouncements();
      setIsCreateModalOpen(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setCreateLoading(false);
    }
  };

  // Edit Handlers
  const handleEditOpen = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingAnnouncement(null);
  };

  const handleEditSubmit = async (
    announcementId: string,
    payload: UpdateAnnouncementPayload
  ) => {
    setEditLoading(true);
    try {
      await announcementService.updateAnnouncement(announcementId, payload);
      toast.success("Announcement updated successfully");
      fetchAnnouncements();
      setIsEditModalOpen(false);
      setEditingAnnouncement(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Handlers
  const handleDeleteOpen = (announcement: Announcement) => {
    setDeletingAnnouncement(announcement);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingAnnouncement(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAnnouncement) return;

    setDeleteLoading(true);
    try {
      await announcementService.deleteAnnouncement(
        deletingAnnouncement.announcement_id
      );
      toast.success("Announcement deleted successfully");
      fetchAnnouncements();
      setIsDeleteModalOpen(false);
      setDeletingAnnouncement(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = useCallback(
    async (announcement: Announcement) => {
      try {
        const newStatus =
          announcement.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        await announcementService.updateAnnouncementStatus(
          announcement.announcement_id,
          newStatus
        );

        toast.success(`Announcement status updated to ${newStatus}`);
        fetchAnnouncements();
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error(errorMessage);
      }
    },
    [fetchAnnouncements]
  );

  const getStatusColor = (status: string): string => {
    return status === "ACTIVE" ? "text-green-700 " : "text-gray-700 ";
  };

  const announcementColumns: TableColumn<Announcement>[] = useMemo(
    () => [
      {
        name: "Title",
        selector: (row) => row.title,
        sortable: true,
      },
      {
        name: "Content",
        selector: (row) => row.content,
        sortable: true,
        cell: (row) => (
          <div className="max-w-md text-sm text-gray-600 truncate">
            {row.content}
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
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {new Date(row.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center gap-2">
            {canModify ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(row)}
                  className={
                    row.status === "ACTIVE"
                      ? "bg-orange-500/10 hover:bg-orange-500/20 border-orange-200 text-orange-700"
                      : "bg-green-500/10 hover:bg-green-500/20 border-green-200 text-green-700"
                  }
                  title={`Set to ${
                    row.status === "ACTIVE" ? "Inactive" : "Active"
                  }`}
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditOpen(row)}
                  className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteOpen(row)}
                  className="bg-red-500/10 hover:bg-red-500/20 border-red-200 text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">View only</span>
            )}
          </div>
        ),
      },
    ],
    [canModify, handleToggleStatus]
  );

  return (
    <div className="space-y-6 relative">
      <AnnouncementFilter
        onApplyFilters={handleApplyFilters}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />
      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Announcement Management"
          description="Manage system announcements and notifications"
          columns={announcementColumns}
          data={announcements}
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
                  <Megaphone className="w-full h-full" />
                </div>
                <p className="text-gray-500 font-medium">
                  No announcement data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Create Modal */}
      <CreateAnnouncementModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateClose}
        onSubmit={handleCreateSubmit}
        isLoading={createLoading}
      />

      {/* Edit Modal */}
      <EditAnnouncementModal
        isOpen={isEditModalOpen}
        announcement={editingAnnouncement}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        isLoading={editLoading}
      />

      {/* Delete Modal */}
      <DeleteAnnouncementModal
        isOpen={isDeleteModalOpen}
        announcement={deletingAnnouncement}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default withRoleProtection(AnnouncementListPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
  "StaffFinance",
]);
