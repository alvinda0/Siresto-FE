// app/vendors/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { vendorService } from "@/services/vendor.service";
import { Vendor, VendorQueryParams } from "@/types/vendor";
import { Calendar, Server, Eye, Globe } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { VendorDetailModal } from "@/components/vendor/VendorDetailModal";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

const VendorListPage = () => {
  usePageTitle("Vendors");
  const router = useRouter();

  // Data states
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<VendorQueryParams>({
    page: 1,
    limit: 10,
  });

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vendorService.getVendors(filters);

      setVendors(Array.isArray(response.data) ? response.data : []);

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
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Filter handlers
  const handleApplyFilters = (newFilters: VendorQueryParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleCreateVendor = () => {
    router.push("/vendors/create");
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Detail Modal Handlers
  const openDetailModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedVendor(null);
  };

  // Table columns
  const vendorColumns: TableColumn<Vendor>[] = useMemo(
    () => [
      {
        name: "Vendor Name",
        selector: (row) => row.name,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-gray-900">{row.name}</span>
          </div>
        ),
      },
      {
        name: "Production Endpoint",
        selector: (row) => row.endpoint_url,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-600" />
            <span
              className="text-sm text-gray-700 font-mono truncate max-w-xs"
              title={row.endpoint_url}
            >
              {row.endpoint_url}
            </span>
          </div>
        ),
      },
      {
        name: "Sandbox Endpoint",
        selector: (row) => row.sandbox_endpoint_url,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-orange-600" />
            <span
              className="text-sm text-gray-700 font-mono truncate max-w-xs"
              title={row.sandbox_endpoint_url}
            >
              {row.sandbox_endpoint_url}
            </span>
          </div>
        ),
      },
      {
        name: "Created At",
        selector: (row) => row.created_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetailModal(row);
              }}
              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 rounded-lg transition-colors"
              title="View Detail"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
        ignoreRowClick: true,
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Data Table */}
      <CustomDataTable
        title="Vendor Management"
        description="View and manage all vendors"
        columns={vendorColumns}
        data={vendors}
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
                <Server className="w-full h-full" />
              </div>
              <p className="text-gray-600 font-medium mb-4">No vendors found</p>
              <button
                onClick={handleCreateVendor}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-blue-500/20"
              >
                Create First Vendor
              </button>
            </div>
          </div>
        }
      />

      {/* Detail Modal */}
      <VendorDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        vendor={selectedVendor}
      />
    </div>
  );
};

export default withRoleProtection(VendorListPage, ["Superuser", "Supervisor"]);