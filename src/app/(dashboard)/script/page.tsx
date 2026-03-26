// ScriptPage.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { TableColumn } from "react-data-table-component";
import CustomDataTable from "@/components/CustomDataTable";
import { scriptService } from "@/services/script.service";
import { EngineSettings } from "@/types/script";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Power, PowerOff, FilePen, Trash2, Check, Copy } from "lucide-react";
import { withRoleProtection } from "@/components/ProtectedRoles";
import {
  ScriptFilter,
  ScriptFilterParams,
} from "@/components/script/ScriptFilter";
import { EditEngineModal } from "@/components/script/EditEngineModal"; // ✅ NEW
import { DeleteEngineModal } from "@/components/script/DeleteEngineModal"; // ✅ NEW

const ScriptPage = () => {
  usePageTitle("Engine Settings");
  const [scripts, setScripts] = useState<EngineSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ScriptFilterParams>({});
  const [selectedScript, setSelectedScript] = useState<EngineSettings | null>(
    null,
  );
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editScript, setEditScript] = useState<EngineSettings | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteScript, setDeleteScript] = useState<EngineSettings | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchScripts = async (filterParams?: ScriptFilterParams) => {
    try {
      setLoading(true);
      const response = await scriptService.getEngineSettings(filterParams);
      setScripts(response.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts(filters);
  }, [filters]);

  const handleApplyFilters = (newFilters: ScriptFilterParams) => {
    setFilters(newFilters);
  };

  // Toggle handlers
  const handleToggleClick = (script: EngineSettings) => {
    setSelectedScript(script);
    setIsToggleDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!selectedScript) return;
    try {
      setIsUpdating(true);
      await scriptService.updateEngineSettings(selectedScript.id, {
        is_enable: !selectedScript.is_enable,
      });
      toast.success(
        `Engine settings ${!selectedScript.is_enable ? "enabled" : "disabled"} successfully`,
      );
      await fetchScripts(filters);
      setIsToggleDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
      setSelectedScript(null);
    }
  };

  const handleEditClick = (script: EngineSettings) => {
    setEditScript(script);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (script: EngineSettings) => {
    setDeleteScript(script);
    setIsDeleteModalOpen(true);
  };

  const handleCopyUrl = (row: EngineSettings) => {
    if (!row.url) return;
    navigator.clipboard.writeText(row.url).then(() => {
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const scriptColumns: TableColumn<EngineSettings>[] = useMemo(
    () => [
      {
        name: "Partner",
        selector: (row) => row.partner_name || "-",
        sortable: true,
      },
      {
        name: "Platform",
        selector: (row) => row.platform_name || "-",
        sortable: true,
      },
      {
        name: "Agent",
        selector: (row) => row.agent_name || "-",
        sortable: true,
      },
      {
        name: "Engine",
        selector: (row) => row.engine || "-",
        sortable: true,
      },
      {
        name: "Code",
        selector: (row) => row.code || "-",
        sortable: true,
      },
      {
        name: "URL",
        selector: (row) => row.url || "-",
        sortable: false,
        width: "320px",
        cell: (row) => {
          const isCopied = copiedId === row.id;
          return row.url ? (
            <div className="flex items-center gap-2 w-full">
              <span
                title={row.url}
                className="text-sm text-gray-600 truncate flex-1 max-w-62.5"
              >
                {row.url}
              </span>
              <button
                onClick={() => handleCopyUrl(row)}
                title={isCopied ? "Copied!" : "Copy URL"}
                className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200 ${
                  isCopied
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600"
                }`}
              >
                {isCopied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
      },
      {
        name: "Status",
        selector: (row) => (row.is_enable ? "Enabled" : "Disabled"),
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              row.is_enable
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {row.is_enable ? "Enabled" : "Disabled"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "250px",
        cell: (row) => (
          <div className="flex items-center gap-2 py-2">
            {/* Toggle Button */}
            <button
              onClick={() => handleToggleClick(row)}
              title={row.is_enable ? "Disable" : "Enable"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${
                row.is_enable
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-400 hover:bg-gray-500 text-white"
              }`}
            >
              {row.is_enable ? (
                <Power className="w-3.5 h-3.5" />
              ) : (
                <PowerOff className="w-3.5 h-3.5" />
              )}
              <span>{row.is_enable ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => handleEditClick(row)}
              title="Edit Engine Data"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200"
            >
              <FilePen className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => handleDeleteClick(row)}
              title="Delete Engine Settings"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs bg-red-500 hover:bg-red-600 text-white transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Del</span>
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <ScriptFilter
        onApplyFilters={handleApplyFilters}
        onRefresh={() => fetchScripts(filters)}
      />

      <div className="w-full">
        <CustomDataTable
          title="Engine Settings"
          description="Manage engine settings and their status"
          columns={scriptColumns}
          data={scripts}
          progressPending={loading}
          progressComponent={
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          }
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">
                  No engine settings available
                </p>
              </div>
            </div>
          }
        />
      </div>

      {/* Toggle Dialog (existing) */}
      <AlertDialog
        open={isToggleDialogOpen}
        onOpenChange={setIsToggleDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedScript?.is_enable ? "Disable" : "Enable"} Engine
              Settings?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Are you sure you want to{" "}
                  {selectedScript?.is_enable ? "disable" : "enable"} this engine
                  settings (ID: {selectedScript?.id})?
                </p>
                <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Category:</span>{" "}
                    {selectedScript?.category || "-"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Engine:</span>{" "}
                    {selectedScript?.engine || "-"}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Code:</span>{" "}
                    {selectedScript?.code || "-"}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              disabled={isUpdating}
              className={
                selectedScript?.is_enable
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {isUpdating ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ NEW: Edit Engine Modal */}
      <EditEngineModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => fetchScripts(filters)}
        engineSettings={editScript}
      />

      {/* ✅ NEW: Delete Engine Modal */}
      <DeleteEngineModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onSuccess={() => fetchScripts(filters)}
        engineSettings={deleteScript}
      />
    </div>
  );
};

export default withRoleProtection(ScriptPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry",
]);
