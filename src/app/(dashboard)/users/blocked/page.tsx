// app/(dashboard)/users/blocked/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { userService } from "@/services/user.service";
import { User, UserQueryParams } from "@/types/user";
import { RotateCcw, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { UserFilter } from "@/components/user/UserFilter";
import { UnblockUserModal } from "@/components/user/UnblockUserModal";
import { UserDetailModal } from "@/components/user/UserDetailModal";
import { RoleStatsCards } from "@/components/user/RoleStatsCards";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const BlockedUsersPage = () => {
  usePageTitle("Blocked Users");
  const router = useRouter();

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [roleStats, setRoleStats] = useState<{ [key: string]: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state - always include deleted=true for blocked users
  const [filters, setFilters] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
    deleted: true,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Unblock Modal State
  const [unblockModal, setUnblockModal] = useState({
    isOpen: false,
    user: null as User | null,
    isUnblocking: false,
  });

  // Fetch blocked users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers(filters);

      setUsers(Array.isArray(response.data) ? response.data : []);
      setRoleStats(response.roles || null);

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
      setUsers([]);
      setRoleStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter handlers
  const handleApplyFilters = (newFilters: UserQueryParams) => {
    setFilters((prev) => ({ 
      ...prev, 
      ...newFilters, 
      page: 1, 
      deleted: true // Always keep deleted=true for blocked users
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      deleted: true, // Always keep deleted=true for blocked users
    });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (user: User) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedUser(null);
  };

  // Unblock Modal Handlers
  const openUnblockModal = (user: User) => {
    setUnblockModal({
      isOpen: true,
      user,
      isUnblocking: false,
    });
  };

  const closeUnblockModal = () => {
    setUnblockModal({
      isOpen: false,
      user: null,
      isUnblocking: false,
    });
  };

  const handleUnblockUser = async () => {
    if (!unblockModal.user) return;

    try {
      setUnblockModal((prev) => ({ ...prev, isUnblocking: true }));
      
      await userService.unblockUser(unblockModal.user.user_id);
      
      toast.success("User unblocked successfully");
      closeUnblockModal();
      fetchUsers(); // Refresh the list
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setUnblockModal((prev) => ({ ...prev, isUnblocking: false }));
    }
  };

  // Table columns
  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {new Date(row.created_at).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        ),
      },
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        width: "180px",
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.name}
            </div>
          </div>
        ),
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        width: "200px",
        cell: (row) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.email}
          </div>
        ),
      },
      {
        name: "Phone",
        selector: (row) => row.phone || "",
        sortable: true,
        width: "130px",
        cell: (row) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.phone || "-"}
          </div>
        ),
      },
      {
        name: "Role",
        selector: (row) => row.role_name,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {row.role_name}
          </span>
        ),
      },
      {
        name: "Internal",
        selector: (row) => row.is_internal,
        sortable: true,
        width: "80px",
        cell: (row) => (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              row.is_internal
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {row.is_internal ? "Yes" : "No"}
          </span>
        ),
      },
      {
        name: "Partner",
        selector: (row) => row.partner_name || "",
        sortable: true,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.partner_name || "-"}
          </div>
        ),
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name || "",
        sortable: true,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.platform_name || "-"}
          </div>
        ),
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name || "",
        sortable: true,
        width: "120px",
        cell: (row) => (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {row.agent_name || "-"}
          </div>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal(row);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openUnblockModal(row);
              }}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Unblock User"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Blocked Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage blocked users and restore their access
          </p>
        </div>
      </div>

      {/* Role Stats Cards */}
      {roleStats && <RoleStatsCards roleStats={roleStats} />}

      {/* Filter */}
      <UserFilter
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <CustomDataTable
        columns={columns}
        data={users}
        progressPending={loading}
        pagination
        paginationServer
        paginationTotalRows={pagination.total}
        paginationDefaultPage={pagination.currentPage}
        paginationPerPage={pagination.limit}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        onChangeRowsPerPage={handlePerRowsChange}
        onChangePage={handlePageChange}
        noDataComponent={
          <div className="text-center py-12">
            <p className="text-gray-600 font-medium">No blocked users found</p>
          </div>
        }
      />

      {/* Detail Modal */}
      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
      />

      {/* Unblock Modal */}
      <UnblockUserModal
        isOpen={unblockModal.isOpen}
        onClose={closeUnblockModal}
        user={unblockModal.user}
        onConfirm={handleUnblockUser}
        isUnblocking={unblockModal.isUnblocking}
      />
    </div>
  );
};

export default withRoleProtection(BlockedUsersPage, [
  "Superuser",
  "Supervisor", 
  "StaffEntry"
]);