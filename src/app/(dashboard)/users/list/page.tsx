// app/users/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { userService } from "@/services/user.service";
import { User, UserQueryParams, UpdateUserPayload } from "@/types/user";
import { Edit2, Trash2, Eye, RotateCcw } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { UserFilter } from "@/components/user/UserFilter";
import { IpWhitelistModal } from "@/components/user/IpWhitelistModal";
import { EditUserModal } from "@/components/user/EditUserModal";
import { DeleteUserModal } from "@/components/user/DeleteUserModal";
import { UserDetailModal } from "@/components/user/UserDetailModal";
import { RoleStatsCards } from "@/components/user/RoleStatsCards";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import { ResetPinModal } from "@/components/user/ResetPinModal";
import { Reset2FAModal } from "@/components/user/Reset2FAModal";
import { createPortal } from "react-dom";

const UserListPage = () => {
  usePageTitle("User List");
  const router = useRouter();

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [roleStats, setRoleStats] = useState<{ [key: string]: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<UserQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Edit Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    user: null as User | null,
    isLoading: false,
  });

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    user: null as User | null,
    isDeleting: false,
  });

  // IP Whitelist Modal State
  const [ipModal, setIpModal] = useState({
    isOpen: false,
    ipAddresses: [] as string[],
  });

  // Reset Pin Modal State
  const [resetPinModal, setResetPinModal] = useState({
    isOpen: false,
    user: null as User | null,
  });

  // Reset 2FA Modal State
  const [reset2FAModal, setReset2FAModal] = useState({
    isOpen: false,
    user: null as User | null,
  });

  // Fetch users
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
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    // Reset filters to initial state and reload all data
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  const handleCreateUser = () => {
    router.push("/users/create");
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

  // Edit handlers
  const openEditModal = (user: User) => {
    setEditModal({
      isOpen: true,
      user,
      isLoading: false,
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      user: null,
      isLoading: false,
    });
  };

  // Reset Pin handlers
  const openResetPinModal = (user: User) => {
    setResetPinModal({
      isOpen: true,
      user,
    });
  };

  const closeResetPinModal = () => {
    setResetPinModal({
      isOpen: false,
      user: null,
    });
  };

  // Reset 2FA handlers
  const openReset2FAModal = (user: User) => {
    setReset2FAModal({
      isOpen: true,
      user,
    });
  };

  const closeReset2FAModal = () => {
    setReset2FAModal({
      isOpen: false,
      user: null,
    });
  };

  const handleEditSubmit = async (payload: UpdateUserPayload) => {
    if (!editModal.user?.user_id) {
      toast.error("User ID is missing");
      return;
    }

    try {
      setEditModal((prev) => ({ ...prev, isLoading: true }));

      const updatedUser = await userService.updateUser(
        editModal.user.user_id,
        payload,
      );

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_id === editModal.user?.user_id ? { ...u, ...updatedUser } : u,
        ),
      );

      toast.success("User updated successfully");
      closeEditModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setEditModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Delete handlers
  const openDeleteModal = (user: User) => {
    setDeleteModal({
      isOpen: true,
      user,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      user: null,
      isDeleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user?.user_id) {
      toast.error("User ID is missing");
      return;
    }

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

      await userService.deleteUser(deleteModal.user.user_id);

      // Update local state
      setUsers((prevUsers) =>
        prevUsers.filter((u) => u.user_id !== deleteModal.user?.user_id),
      );

      toast.success("User deleted successfully");
      closeDeleteModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // IP Whitelist handlers
  const openIpModal = (ipWhitelist: string) => {
    try {
      const ips = JSON.parse(ipWhitelist) as string[];
      setIpModal({
        isOpen: true,
        ipAddresses: ips,
      });
    } catch {
      toast.error("Invalid IP whitelist format");
    }
  };

  const closeIpModal = () => {
    setIpModal({
      isOpen: false,
      ipAddresses: [],
    });
  };

  // Utility functions
  const getRoleColor = (roleId: string): string => {
    const colors: { [key: string]: string } = {
      "f077e798-b600-4e8c-800c-d7237e8559bc": "text-red-700", // Superuser
      "6a2028e4-4289-4910-9f07-1ea4dcf26914": "text-orange-700", // Supervisor
      "45f8c67e-5beb-4522-a123-0374c9a9dead": "text-blue-700", // Staff
      "d871483a-b57b-4a4c-84ea-1a21bd66df42": "text-yellow-700", // PartnerOwner
      "efc07a01-1d54-4843-97ec-8365455fde8d": "text-indigo-700", // PlatformOwner
      "17f07374-3cba-47df-bce1-080fed5c0680": "text-cyan-700", // PlatformStaff
      "6452b2bc-066d-4e52-907e-83fc7d61b84e": "text-purple-700", // AgentOwner
      "e17908d5-c18e-4c5e-b6c9-b83afe2d49f8": "text-pink-700", // AgentStaff
      "5f8ab095-4edb-4d21-978c-0dd1e104c9bb": "text-slate-700", // System
    };
    return colors[roleId] || "text-gray-700";
  };

  // Table columns
  const userColumns: TableColumn<User>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        width: "120px",
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
        width: "150px",
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
        width: "180px",
      },
      {
        name: "Phone",
        selector: (row) => row.phone || "-",
        sortable: true,
        width: "150px",
      },
      {
        name: "Roles",
        selector: (row) => row.role_name,
        sortable: true,
        width: "150px",
        cell: (row) => (
          <span
            className={`text-xs font-bold ${getRoleColor(row.role_id || "")}`}
          >
            {row.role_name}
          </span>
        ),
      },
      {
        name: "Internal",
        selector: (row) => row.is_internal,
        sortable: true,
        width: "100px",
        cell: (row) => (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              row.is_internal
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.is_internal ? "Yes" : "No"}
          </span>
        ),
      },
      {
        name: "Partner",
        selector: (row) => row.partner_name || "-",
        sortable: true,
        width: "120px",
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name || "-",
        sortable: true,
        width: "120px",
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name || "-",
        sortable: true,
        width: "150px",
      },
      {
        name: "2FA",
        selector: (row) => row.is_2fa,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold ${
              row.is_2fa
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {row.is_2fa ? "Enabled" : "Disabled"}
          </span>
        ),
      },
      {
        name: "IP Whitelist",
        selector: (row) => row.ip_whitelist || "-",
        sortable: true,
        width: "130px",
        cell: (row) => {
          if (!row.ip_whitelist) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          try {
            const ips = JSON.parse(row.ip_whitelist) as string[];
            if (ips.length === 0) {
              return <span className="text-gray-400 text-sm">-</span>;
            }

            return (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openIpModal(row.ip_whitelist!);
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
              >
                View ({ips.length})
              </button>
            );
          } catch {
            return <span className="text-gray-400 text-sm">-</span>;
          }
        },
      },
      {
        name: "Actions",
        width: "200px",
        cell: (row) => {
          const [showDropdown, setShowDropdown] = useState(false);
          const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(
            null,
          );

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetailModal(row);
                }}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="View detail"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Reset Dropdown */}
              <div className="relative">
                <button
                  ref={setButtonRef}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Reset options"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {showDropdown &&
                  buttonRef &&
                  createPortal(
                    <>
                      <div
                        className="fixed inset-0 z-100"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div
                        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-999 w-48"
                        style={{
                          top: `${buttonRef.getBoundingClientRect().bottom + 8}px`,
                          left: `${buttonRef.getBoundingClientRect().right - 192}px`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(false);
                            openResetPinModal(row);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset PIN
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(false);
                            openReset2FAModal(row);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-orange-50 transition-colors flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset 2FA
                        </button>
                      </div>
                    </>,
                    document.body,
                  )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditModal(row);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit user"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openDeleteModal(row);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete user"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <UserFilter
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onCreateClick={handleCreateUser}
      />

      {/* Role Statistics Cards */}
      <RoleStatsCards roleStats={roleStats} />

      {/* Data Table */}
      <CustomDataTable
        title="User Management"
        description="Manage and view all system users"
        columns={userColumns}
        data={users}
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium mb-4">No users found</p>
              <button
                onClick={handleCreateUser}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
              >
                Create First User
              </button>
            </div>
          </div>
        }
      />

      {/* Detail Modal */}
      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        user={selectedUser}
      />

      {/* Edit Modal */}
      <EditUserModal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        user={editModal.user}
        onSubmit={handleEditSubmit}
        isLoading={editModal.isLoading}
      />

      {/* Delete Modal */}
      <DeleteUserModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        user={deleteModal.user}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteModal.isDeleting}
      />

      {/* IP Whitelist Modal */}
      <IpWhitelistModal
        isOpen={ipModal.isOpen}
        onClose={closeIpModal}
        ipAddresses={ipModal.ipAddresses}
      />

      {/* Reset Pin Modal */}
      <ResetPinModal
        isOpen={resetPinModal.isOpen}
        onClose={closeResetPinModal}
        user={resetPinModal.user}
      />

      {/* Reset 2FA Modal */}
      <Reset2FAModal
        isOpen={reset2FAModal.isOpen}
        onClose={closeReset2FAModal}
        user={reset2FAModal.user}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default withRoleProtection(UserListPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
