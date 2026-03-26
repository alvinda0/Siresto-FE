// app/credentials/agent/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Copy, Check, Key } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  AgentCredential,
  AgentCredentialQueryParams,
} from "@/types/credentials";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { credentialsService } from "@/services/credentials.service";
import { Button } from "@/components/ui/button";
import { AgentCredentialFilter } from "@/components/credentials/AgentCredentialFilter";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const AgentCredentialsPage = () => {
  usePageTitle("Agent Credentials");

  const [credentials, setCredentials] = useState<AgentCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  const [filters, setFilters] = useState<AgentCredentialQueryParams>({
    page: 1,
    limit: 10,
  });

  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await credentialsService.getAgentCredentials(filters);

      setCredentials(Array.isArray(response.data) ? response.data : []);

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
      setCredentials([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleApplyFilters = (newFilters: AgentCredentialQueryParams) => {
    setFilters((prev: AgentCredentialQueryParams) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: AgentCredentialQueryParams) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev: AgentCredentialQueryParams) => ({
      ...prev,
      limit: newPerPage,
      page: 1,
    }));
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      ACTIVE: "text-green-700",
      PENDING: "text-yellow-700",
      INACTIVE: "text-red-700",
    };
    return colors[status] || "text-gray-700";
  };

  const credentialColumns: TableColumn<AgentCredential>[] = useMemo(
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
        name: "API Key",
        selector: (row) => row.api_key,
        width: "250px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[150px]"
                title={row.api_key}
              >
                {row.api_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(row.api_key, `api-${row.agent_id}`)}
              className="h-6 w-6 p-0"
            >
              {copiedField === `api-${row.agent_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Secret Key",
        selector: (row) => row.secret_key,
        width: "250px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[150px]"
                title={row.secret_key}
              >
                {row.secret_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(row.secret_key, `secret-${row.agent_id}`)
              }
              className="h-6 w-6 p-0"
            >
              {copiedField === `secret-${row.agent_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Webhook Secret",
        selector: (row) => row.webhook_secret,
        width: "250px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[150px]"
                title={row.webhook_secret}
              >
                {row.webhook_secret}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(row.webhook_secret, `webhook-${row.agent_id}`)
              }
              className="h-6 w-6 p-0"
            >
              {copiedField === `webhook-${row.agent_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [copiedField]
  );

  return (
    <div className="space-y-6">
      {/* Filter */}
      <AgentCredentialFilter onApplyFilters={handleApplyFilters} />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title="Agent Credentials"
          description="API keys and secret keys for agents with pagination"
          columns={credentialColumns}
          data={credentials}
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
                <Key className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">
                  No agent credentials found
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default withRoleProtection(AgentCredentialsPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
