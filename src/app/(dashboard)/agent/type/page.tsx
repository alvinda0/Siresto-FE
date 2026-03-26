// app/agent/type/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { agentTypeService } from "@/services/agentType.service";
import { AgentType, AgentTypeQueryParams } from "@/types/agentType";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { AgentTypeFilter } from "@/components/agent/AgentTypeFilter";
import { EditAgentTypeModal } from "@/components/agent/EditAgentTypeModal";
import { DeleteAgentTypeModal } from "@/components/agent/DeleteAgentTypeModal";
import { AgentTypeDetailModal } from "@/components/agent/AgentTypeDetailModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const AgentTypeListPage = () => {
  usePageTitle("Agent Types");
  const router = useRouter();

  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<AgentTypeQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAgentTypeForDetail, setSelectedAgentTypeForDetail] = useState<AgentType | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentTypeToDelete, setAgentTypeToDelete] = useState<AgentType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAgentTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await agentTypeService.getAgentTypes(filters);

      setAgentTypes(Array.isArray(response.data) ? response.data : []);

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
      setAgentTypes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAgentTypes();
  }, [fetchAgentTypes]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleApplyFilters = (newFilters: AgentTypeQueryParams) => {
    setFilters((prev: AgentTypeQueryParams) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: AgentTypeQueryParams) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev: AgentTypeQueryParams) => ({
      ...prev,
      limit: newPerPage,
      page: 1,
    }));
  };

  // Detail Modal Handlers
  const openDetailModal = (agentType: AgentType) => {
    setSelectedAgentTypeForDetail(agentType);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedAgentTypeForDetail(null);
  };

  // Edit Modal Handlers
  const openEditModal = (agentType: AgentType) => {
    setSelectedAgentType(agentType);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedAgentType(null);
  };

  const handleEditSuccess = useCallback(() => {
    toast.success("Agent type updated successfully");
    setSuccessMessage("Agent type updated successfully");
    fetchAgentTypes();
  }, [fetchAgentTypes]);

  // Delete Modal Handlers
  const openDeleteModal = (agentType: AgentType) => {
    setAgentTypeToDelete(agentType);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAgentTypeToDelete(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!agentTypeToDelete) return;

    try {
      setIsDeleting(true);
      await agentTypeService.deleteAgentType(agentTypeToDelete.agent_type_id);
      toast.success("Agent type deleted successfully");
      setSuccessMessage("Agent type deleted successfully");
      fetchAgentTypes();
      closeDeleteModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const agentTypeColumns: TableColumn<AgentType>[] = useMemo(
    () => [
      {
        name: "Type",
        selector: (row) => row.type,
        sortable: true,
      },
      {
        name: "Description",
        selector: (row) => row.description,
        sortable: true,
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
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditModal(row)}
              className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
            >
              <Edit className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => openDeleteModal(row)}
              className="bg-red-500/10 hover:bg-red-500/20 border-red-200 text-red-700"
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
    <div className="space-y-6 relative">
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg animate-in slide-in-from-top fade-in z-50">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-green-800">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <AgentTypeFilter
        onApplyFilters={handleApplyFilters}
        onCreateClick={() => router.push("/agent/type/create")}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Agent Type Management"
          description="Manage and view all agent types"
          columns={agentTypeColumns}
          data={agentTypes}
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No agent type data available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <AgentTypeDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        agentType={selectedAgentTypeForDetail}
      />

      {/* Edit Modal */}
      {editModalOpen && selectedAgentType && (
        <EditAgentTypeModal
          isOpen={editModalOpen}
          agentType={selectedAgentType}
          onClose={closeEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Modal */}
      <DeleteAgentTypeModal
        isOpen={deleteModalOpen}
        agentType={agentTypeToDelete}
        isDeleting={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default withRoleProtection(AgentTypeListPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);