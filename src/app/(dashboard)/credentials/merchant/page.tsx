// app/credentials/merchant/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { Copy, Check, Key } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import {
  MerchantCredential,
  MerchantCredentialQueryParams,
} from "@/types/credentials";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { credentialsService } from "@/services/credentials.service";
import { Button } from "@/components/ui/button";
import { MerchantCredentialFilter } from "@/components/credentials/MerchantCredentialFilter";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const MerchantCredentialsPage = () => {
  usePageTitle("Merchant Credentials");

  const [credentials, setCredentials] = useState<MerchantCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [filters, setFilters] = useState<MerchantCredentialQueryParams>({});

  const fetchCredentials = useCallback(async () => {
    try {
      setLoading(true);
      const response = await credentialsService.getMerchantCredentials(filters);

      setCredentials(Array.isArray(response.data) ? response.data : []);
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

  const handleApplyFilters = (newFilters: MerchantCredentialQueryParams) => {
    setFilters(newFilters);
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

  const getEnvironmentColor = (env: string): string => {
    return env === "LIVE" ? "text-purple-700" : "text-blue-700";
  };

  const credentialColumns: TableColumn<MerchantCredential>[] = useMemo(
    () => [
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <span className="text-xs">
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
        width: "120px",
        cell: (row) => (
          <span className={`text-xs font-bold ${getStatusColor(row.status)}`}>
            {row.status}
          </span>
        ),
      },
      {
        name: "Environment",
        selector: (row) => row.environment,
        sortable: true,
        width: "130px",
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
        name: "Prod API Key",
        selector: (row) => row.prod_api_key,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[120px]"
                title={row.prod_api_key}
              >
                {row.prod_api_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(row.prod_api_key, `prod-api-${row.merchant_id}`)
              }
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copiedField === `prod-api-${row.merchant_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Prod Callback Key",
        selector: (row) => row.prod_callback_key,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[120px]"
                title={row.prod_callback_key}
              >
                {row.prod_callback_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(
                  row.prod_callback_key,
                  `prod-callback-${row.merchant_id}`
                )
              }
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copiedField === `prod-callback-${row.merchant_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Dev API Key",
        selector: (row) => row.dev_api_key,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[120px]"
                title={row.dev_api_key}
              >
                {row.dev_api_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(row.dev_api_key, `dev-api-${row.merchant_id}`)
              }
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copiedField === `dev-api-${row.merchant_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Dev Callback Key",
        selector: (row) => row.dev_callback_key,
        width: "200px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[120px]"
                title={row.dev_callback_key}
              >
                {row.dev_callback_key}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(
                  row.dev_callback_key,
                  `dev-callback-${row.merchant_id}`
                )
              }
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copiedField === `dev-callback-${row.merchant_id}` ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        ),
      },
      {
        name: "Merchant Token",
        selector: (row) => row.merchant_token,
        width: "250px",
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded">
              <code
                className="text-xs truncate max-w-[170px]"
                title={row.merchant_token}
              >
                {row.merchant_token}
              </code>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                handleCopy(row.merchant_token, `token-${row.merchant_id}`)
              }
              className="h-6 w-6 p-0 flex-shrink-0"
            >
              {copiedField === `token-${row.merchant_id}` ? (
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
      <MerchantCredentialFilter onApplyFilters={handleApplyFilters} />

      {/* Data Table - Client Side Pagination */}
      <div className="w-full">
        <CustomDataTable
          title="Merchant Credentials"
          description="API keys, callback keys, and tokens for merchants (filtered results, client-side pagination)"
          columns={credentialColumns}
          data={credentials}
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          noDataComponent={
            <div className="text-center py-8">
              <div className="flex flex-col items-center justify-center">
                <Key className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 font-medium">
                  No merchant credentials found
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default withRoleProtection(MerchantCredentialsPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
