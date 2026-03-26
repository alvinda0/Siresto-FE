// app/audit-log/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Shield, Eye } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { AuditLog, AuditLogQueryParams } from "@/types/audit";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { auditService } from "@/services/audit.service";
import { Button } from "@/components/ui/button";
import { AuditLogDetailModal } from "@/components/audit/AuditLogDetailModal";
import { AuditLogFilters } from "@/components/audit/AuditLogFilters";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const AuditLogPage = () => {
  usePageTitle("Audit Log");
  const router = useRouter();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<AuditLogQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal States
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(
    null
  );
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await auditService.getAuditLogs(filters);

      setAuditLogs(Array.isArray(response.data) ? response.data : []);

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
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleApplyFilters = (newFilters: AuditLogQueryParams) => {
    setFilters({
      page: 1,
      limit: newFilters.limit || 10,
      search: newFilters.search,
      status: newFilters.status,
      resource: newFilters.resource,
      action: newFilters.action,
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: AuditLogQueryParams) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev: AuditLogQueryParams) => ({
      ...prev,
      limit: newPerPage,
      page: 1,
    }));
  };

  // Detail Modal Handlers
  const openDetailModal = async (auditId: string) => {
    try {
      setLoadingDetail(true);
      setDetailModalOpen(true);

      const data = await auditService.getAuditLogById(auditId);
      setSelectedAuditLog(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      closeDetailModal();
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedAuditLog(null);
  };

  const getActionColor = (action: string): string => {
    const colors: { [key: string]: string } = {
      LOGIN: "text-blue-700",
      CREATE: "text-green-700",
      UPDATE: "text-yellow-700",
      DELETE: "text-red-700",
      READ: "text-purple-700",
    };
    return colors[action] || "text-gray-700";
  };

  const getResourceColor = (resource: string): string => {
    const colors: { [key: string]: string } = {
      AUTH: "text-indigo-700",
      USER: "text-cyan-700",
      DISBURSEMENTS: "text-emerald-700",
      PLATFORM: "text-violet-700",
    };
    return colors[resource] || "text-gray-700";
  };

  const auditLogColumns: TableColumn<AuditLog>[] = useMemo(
    () => [
      {
        name: "Timestamp",
        selector: (row) => row.timestamp,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs font-medium text-gray-800">
                {new Date(row.timestamp).toLocaleDateString("id-ID")}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(row.timestamp).toLocaleTimeString("id-ID")}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Action",
        selector: (row) => row.action,
        sortable: true,
        cell: (row) => (
          <span className={`text-xs font-bold ${getActionColor(row.action)}`}>
            {row.action}
          </span>
        ),
      },
      {
        name: "Username",
        selector: (row) => row.username || "-",
        sortable: true,
      },
      {
        name: "Resource",
        selector: (row) => row.resource,
        sortable: true,
        cell: (row) => (
          <span
            className={`text-xs font-bold ${getResourceColor(row.resource)}`}
          >
            {row.resource}
          </span>
        ),
      },
      {
        name: "User ID",
        selector: (row) => row.user_id,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-gray-700 truncate max-w-[120px]">
              {row.user_id}
            </span>
          </div>
        ),
      },
      {
        name: "IP Address",
        selector: (row) => row.ip_address || "-",
        sortable: true,
      },
      {
        name: "Status",
        selector: (row) => row.success.toString(),
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-1">
            {row.success ? (
              <>
                <span className="text-sm font-bold text-green-700">
                  Success
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-red-700">Failed</span>
              </>
            )}
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDetailModal(row.id)}
            className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700"
          >
            <Eye className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <AuditLogFilters onApplyFilters={handleApplyFilters} />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Activity Log"
          description="Complete record of all system activities"
          columns={auditLogColumns}
          data={auditLogs}
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
                <Shield className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">No audit logs found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Check back later for activity logs
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Detail Modal */}
      <AuditLogDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        auditLog={loadingDetail ? null : selectedAuditLog}
      />
    </div>
  );
};

export default withRoleProtection(AuditLogPage, ["Superuser", "Supervisor"]);
