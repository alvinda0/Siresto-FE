// app/(dashboard)/theme/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import { themeService } from "@/services/theme.service";
import { Theme, ThemeQueryParams, CreateThemeRequest, UpdateThemeRequest } from "@/types/theme";
import { ThemeModal } from "@/components/theme/ThemeModal";
import { ThemeActionHeader } from "@/components/theme/ThemeActionHeader";
import { DeleteThemeModal } from "@/components/theme/DeleteThemeModal";
import { SetDefaultThemeModal } from "@/components/theme/SetDefaultThemeModal";
import { ActionDropdown } from "@/components/ActionDropdown";
import CustomDataTable from "@/components/CustomDataTable";
import { Palette, Edit, Check, Calendar, Trash2, CheckCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import { getErrorMessage } from "@/lib/utils";

const ThemePage = () => {
  usePageTitle("Theme Management");
  const { buttonPrimaryColor } = useTheme();

  // Data states
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });

  // Filter state
  const [filters, setFilters] = useState<ThemeQueryParams>({
    page: 1,
    limit: 10,
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    theme: null as Theme | null,
    isDeleting: false,
  });

  const [defaultModal, setDefaultModal] = useState({
    isOpen: false,
    theme: null as Theme | null,
    isLoading: false,
  });

  // Fetch themes
  const fetchThemes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await themeService.getThemes(filters);

      setThemes(Array.isArray(response.data) ? response.data : []);

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
      setThemes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handlePerRowsChange = (newPerPage: number) => {
    setFilters((prev) => ({ ...prev, limit: newPerPage, page: 1 }));
  };

  // Create/Edit handlers
  const handleCreate = () => {
    setSelectedTheme(null);
    setShowModal(true);
  };

  const handleEdit = (theme: Theme) => {
    setSelectedTheme(theme);
    setShowModal(true);
  };

  const handleSubmit = async (data: CreateThemeRequest | UpdateThemeRequest) => {
    try {
      setSubmitting(true);

      if (selectedTheme) {
        await themeService.updateTheme(selectedTheme.theme_id, data);
        toast.success("Theme updated successfully!");
      } else {
        await themeService.createTheme(data as CreateThemeRequest);
        toast.success("Theme created successfully!");
      }

      setShowModal(false);
      setSelectedTheme(null);
      fetchThemes();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Set default handlers
  const openDefaultModal = (theme: Theme) => {
    if (theme.is_default) {
      toast.info("This theme is already set as default");
      return;
    }
    setDefaultModal({
      isOpen: true,
      theme,
      isLoading: false,
    });
  };

  const closeDefaultModal = () => {
    setDefaultModal({
      isOpen: false,
      theme: null,
      isLoading: false,
    });
  };

  const handleConfirmSetDefault = async () => {
    if (!defaultModal.theme) return;

    try {
      setDefaultModal((prev) => ({ ...prev, isLoading: true }));
      await themeService.updateTheme(defaultModal.theme.theme_id, { is_default: true });
      toast.success("Default theme updated successfully!");
      fetchThemes();
      closeDefaultModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDefaultModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Delete handlers
  const openDeleteModal = (theme: Theme) => {
    if (theme.is_default) {
      toast.error("Cannot delete default theme");
      return;
    }
    setDeleteModal({
      isOpen: true,
      theme,
      isDeleting: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      theme: null,
      isDeleting: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.theme) return;

    try {
      setDeleteModal((prev) => ({ ...prev, isDeleting: true }));
      await themeService.deleteTheme(deleteModal.theme.theme_id);
      toast.success("Theme deleted successfully!");
      fetchThemes();
      closeDeleteModal();
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Table columns
  const themeColumns: TableColumn<Theme>[] = useMemo(
    () => [
      {
        name: "Theme Name",
        selector: (row) => row.name,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold">{row.name}</span>
          </div>
        ),
      },
      {
        name: "Primary Color",
        selector: (row) => row.primary_color,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: row.primary_color }}
            />
            <span className="text-xs font-mono text-gray-600">
              {row.primary_color}
            </span>
          </div>
        ),
      },
      {
        name: "Secondary Color",
        selector: (row) => row.secondary_color,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: row.secondary_color }}
            />
            <span className="text-xs font-mono text-gray-600">
              {row.secondary_color}
            </span>
          </div>
        ),
      },
      {
        name: "Button Primary",
        selector: (row) => row.button_primary_color,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: row.button_primary_color }}
            />
            <span className="text-xs font-mono text-gray-600">
              {row.button_primary_color}
            </span>
          </div>
        ),
      },
      {
        name: "Button Secondary",
        selector: (row) => row.button_secondary_color,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: row.button_secondary_color }}
            />
            <span className="text-xs font-mono text-gray-600">
              {row.button_secondary_color}
            </span>
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row) => row.is_default,
        sortable: true,
        cell: (row) =>
          row.is_default ? (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-500/20 text-green-700 border border-green-500/40 flex items-center gap-1 w-fit">
              <Check className="w-3 h-3" />
              Default
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-700 border border-gray-500/40">
              -
            </span>
          ),
      },
      {
        name: "Updated At",
        selector: (row) => row.updated_at,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              {new Date(row.updated_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        cell: (row) => (
          <ActionDropdown
            actions={[
              {
                label: "Edit",
                icon: <Edit className="w-4 h-4 text-purple-600" />,
                onClick: () => handleEdit(row),
                className: "text-purple-700 hover:bg-purple-50",
              },
              {
                label: row.is_default ? "Already Default" : "Set as Default",
                icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                onClick: () => openDefaultModal(row),
                disabled: row.is_default,
                className: "text-green-700 hover:bg-green-50",
              },
              {
                label: "Delete",
                icon: <Trash2 className="w-4 h-4 text-red-600" />,
                onClick: () => openDeleteModal(row),
                disabled: row.is_default,
                className: "text-red-700 hover:bg-red-50",
              },
            ]}
          />
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      {/* Header Action */}
      <ThemeActionHeader
        onCreateTheme={handleCreate}
        buttonPrimaryColor={buttonPrimaryColor}
      />

      {/* Data Table */}
      <div className="w-full">
        <CustomDataTable
          title=""
          description=""
          columns={themeColumns}
          data={themes}
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
            <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="h-12 w-12 text-purple-400 mb-4">
                  <Palette className="w-full h-full" />
                </div>
                <p className="text-purple-600 font-medium mb-4">
                  No themes found
                </p>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all shadow-lg shadow-purple-500/20"
                >
                  Create First Theme
                </button>
              </div>
            </div>
          }
        />
      </div>

      {/* Create/Edit Modal */}
      <ThemeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTheme(null);
        }}
        onSubmit={handleSubmit}
        theme={selectedTheme}
        loading={submitting}
      />

      {/* Set Default Modal */}
      <SetDefaultThemeModal
        isOpen={defaultModal.isOpen}
        onClose={closeDefaultModal}
        theme={defaultModal.theme}
        onConfirm={handleConfirmSetDefault}
        isLoading={defaultModal.isLoading}
      />

      {/* Delete Modal */}
      <DeleteThemeModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        theme={deleteModal.theme}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  );
};

export default withRoleProtection(ThemePage, ["Superuser", "Supervisor"]);