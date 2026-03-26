// app/agent/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { agentService } from "@/services/agent.service";
import { Agent, AgentQueryParams } from "@/types/agent";
import { AgentFilter } from "@/components/agent/AgentFilter";
import { EditAgentModal } from "@/components/agent/EditAgentModal";
import { DeleteAgentModal } from "@/components/agent/DeleteAgentModal";
import { AgentDetailModal } from "@/components/agent/AgentDetailModal";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const ListAgentPage = () => {
  usePageTitle("Agent List");
  const router = useRouter();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [filters, setFilters] = useState<AgentQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAgentForDetail, setSelectedAgentForDetail] =
    useState<Agent | null>(null);

  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Delete Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await agentService.getAgents(filters);

      setAgents(Array.isArray(response.data) ? response.data : []);

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
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleApplyFilters = (newFilters: AgentQueryParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (agent: Agent) => {
    setSelectedAgentForDetail(agent);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedAgentForDetail(null);
  };

  // Edit Modal Handlers
  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedAgent(null);
  };

  const handleEditSuccess = () => {
    fetchAgents();
  };

  // Delete Modal Handlers
  const openDeleteModal = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setAgentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!agentToDelete) return;

    try {
      await agentService.deleteAgent(agentToDelete.agent_id);
      toast.success("Agent deleted successfully");
      fetchAgents();
      closeDeleteModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      ACTIVE: "text-green-700",
      PENDING: "text-yellow-700",
      INACTIVE: "text-red-700",
      REJECTED: "text-red-800",
    };
    return colors[status] || "text-gray-700";
  };

  const agentColumns: TableColumn<Agent>[] = useMemo(
    () => [
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
      },
      {
        name: "Phone",
        selector: (row) => row.phone_number,
        sortable: true,
      },
      {
        name: "Agent Type",
        selector: (row) => row.agent_type_name,
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name,
        sortable: true,
      },
      {
        name: "Fee",
        selector: (row) => row.fee,
        sortable: true,
        cell: (row) => (
          <span className="text-sm font-semibold text-gray-700">
            {row.fee}%
          </span>
        ),
      },
      {
        name: "Admin Fee",
        selector: (row) => row.admin_fee,
        sortable: true,
        cell: (row) => (
          <span className="text-sm font-semibold text-gray-700">
            {row.admin_fee?.toLocaleString("id-ID")}
          </span>
        ),
      },
      {
        name: "Hide Fee",
        selector: (row) => row.hide_fee,
        sortable: true,
        cell: (row) => (
          <span className="text-sm font-semibold text-gray-700">
            {row.hide_fee?.toLocaleString("id-ID")}
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
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <AgentFilter
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onCreateClick={() => router.push("/agent/create")}
      />

      <CustomDataTable
        title="Agent List"
        description="List of all agents with their status and information"
        columns={agentColumns}
        data={agents}
        progressPending={loading}
        progressComponent={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                No agent data available
              </p>
            </div>
          </div>
        }
      />

      {/* Detail Modal */}
      <AgentDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        agent={selectedAgentForDetail}
      />

      {/* Edit Modal */}
      <EditAgentModal
        isOpen={editModalOpen}
        agent={selectedAgent}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Modal */}
      <DeleteAgentModal
        isOpen={deleteModalOpen}
        agent={agentToDelete}
        isDeleting={false}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default withRoleProtection(ListAgentPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);