// components/agent/analysis/AgentInformation.tsx
"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Types
interface AgentData {
  agentName: string;
  agentId: string;
  totalAssigned: number;
  healthy: number;
  lowUtil: number;
  overCapacity: number;
  inactive: number;
  avgUtilization: number;
  status: "EFFECTIVE" | "NEEDS ATTENTION" | "OVER CAPACITY"; // ✅ UPDATE
}

type SortField =
  | "agentName"
  | "totalAssigned"
  | "healthy"
  | "lowUtil"
  | "overCapacity"
  | "inactive"
  | "avgUtilization"
  | "status";
type SortOrder = "asc" | "desc";

interface AgentInformationProps {
  agentData: AgentData[];
  isLoading: boolean;
  selectedDate: string;
}

export default function AgentInformation({
  agentData,
  isLoading,
  selectedDate,
}: AgentInformationProps) {
  const [sortField, setSortField] = useState<SortField>("avgUtilization");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ==================== UTILITY FUNCTIONS ====================

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Sort function
  const sortData = (
    data: AgentData[],
    field: SortField,
    order: SortOrder,
  ): AgentData[] => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      if (typeof aVal === "string" && typeof bVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Agent Name",
      "Total Assigned",
      "Healthy",
      "Low Util",
      "Over Capacity",
      "Inactive",
      "Avg Util %",
      "Status",
    ];
    const rows = agentData.map((a) => [
      a.agentName,
      a.totalAssigned.toString(),
      a.healthy.toString(),
      a.lowUtil.toString(),
      a.overCapacity.toString(),
      a.inactive.toString(),
      a.avgUtilization.toFixed(1),
      a.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-information-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data berhasil diexport ke CSV");
  };

  // ✅ GET BADGE STYLE BERDASARKAN STATUS
  const getStatusBadgeStyle = (status: AgentData["status"]) => {
    switch (status) {
      case "EFFECTIVE":
        return {
          variant: "default" as const,
          className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300"
        };
      case "OVER CAPACITY":
        return {
          variant: "destructive" as const,
          className: "bg-red-600 text-white hover:bg-red-700 border border-red-700"
        };
      case "NEEDS ATTENTION":
        return {
          variant: "destructive" as const,
          className: "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
        };
    }
  };

  // Get sorted data
  const sortedData = sortData(agentData, sortField, sortOrder);

  // ==================== RENDER ====================

  return (
    <Card className="w-full overflow-hidden gap-0">
      <CardHeader className="border-b border-gray-200/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Agent Information
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Agent performance data for {formatDate(selectedDate)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="bg-white/50 backdrop-blur-sm border-white/40 hover:bg-white/70"
              onClick={() => window.print()}
              title="Print"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white/50 backdrop-blur-sm border-white/40 hover:bg-white/70"
              onClick={handleExportCSV}
              disabled={agentData.length === 0}
              title="Export CSV"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto" style={{ maxHeight: "512px" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr
                className="border-b border-gray-200/50"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("agentName")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "agentName" ? "text-blue-600" : ""
                    }`}
                  >
                    Agent Name
                    {getSortIcon("agentName")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("totalAssigned")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "totalAssigned" ? "text-blue-600" : ""
                    }`}
                  >
                    Total Assigned
                    {getSortIcon("totalAssigned")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("healthy")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "healthy" ? "text-blue-600" : ""
                    }`}
                  >
                    Healthy
                    {getSortIcon("healthy")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("lowUtil")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "lowUtil" ? "text-blue-600" : ""
                    }`}
                  >
                    Low Util
                    {getSortIcon("lowUtil")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("overCapacity")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "overCapacity" ? "text-blue-600" : ""
                    }`}
                  >
                    Over Capacity
                    {getSortIcon("overCapacity")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("inactive")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "inactive" ? "text-blue-600" : ""
                    }`}
                  >
                    Inactive
                    {getSortIcon("inactive")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("avgUtilization")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "avgUtilization" ? "text-blue-600" : ""
                    }`}
                  >
                    Avg Util %{getSortIcon("avgUtilization")}
                  </button>
                </th>
                <th
                  className="text-left p-4 font-semibold text-gray-700"
                  style={{
                    backgroundColor: "rgba(249, 250, 251, 0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <button
                    onClick={() => handleSort("status")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "status" ? "text-blue-600" : ""
                    }`}
                  >
                    Status
                    {getSortIcon("status")}
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-200/30">
                    <td className="p-4">
                      <Skeleton className="h-5 w-32" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-16" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-32" />
                    </td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No agent data available for selected date
                  </td>
                </tr>
              ) : (
                sortedData.map((agent) => {
                  const badgeStyle = getStatusBadgeStyle(agent.status);
                  return (
                    <tr
                      key={agent.agentId}
                      className="border-b border-gray-200/30 hover:bg-gray-50/30 transition-colors"
                    >
                      <td className="p-4 text-gray-800 font-medium">
                        {agent.agentName}
                      </td>
                      <td className="p-4 text-gray-600 font-semibold">
                        {agent.totalAssigned}
                      </td>
                      <td className="p-4 text-emerald-600 font-semibold">
                        {agent.healthy}
                      </td>
                      <td className="p-4 text-orange-600 font-semibold">
                        {agent.lowUtil}
                      </td>
                      <td className="p-4 text-red-600 font-semibold">
                        {agent.overCapacity}
                      </td>
                      <td className="p-4 text-gray-400 font-semibold">
                        {agent.inactive}
                      </td>
                      <td className="p-4 font-bold text-orange-600">
                        {formatPercentage(agent.avgUtilization)}
                      </td>
                      <td className="p-4">
                        {/* ✅ DYNAMIC BADGE BERDASARKAN STATUS */}
                        <Badge
                          variant={badgeStyle.variant}
                          className={badgeStyle.className}
                        >
                          {agent.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && sortedData.length > 0 && (
          <div className="p-4 bg-gray-50/30 border-t border-gray-200/50">
            <div className="flex justify-between items-center text-sm flex-wrap gap-2">
              <span className="text-gray-600">
                Total Agents:{" "}
                <span className="font-semibold text-gray-800">
                  {sortedData.length}
                </span>
              </span>
              <span className="text-gray-600">
                Effective:{" "}
                <span className="font-semibold text-emerald-600">
                  {sortedData.filter((a) => a.status === "EFFECTIVE").length}
                </span>
              </span>
              {/* ✅ TAMBAHAN: OVER CAPACITY SUMMARY */}
              <span className="text-gray-600">
                Over Capacity:{" "}
                <span className="font-semibold text-red-600">
                  {sortedData.filter((a) => a.status === "OVER CAPACITY").length}
                </span>
              </span>
              <span className="text-gray-600">
                Needs Attention:{" "}
                <span className="font-semibold text-orange-600">
                  {
                    sortedData.filter((a) => a.status === "NEEDS ATTENTION")
                      .length
                  }
                </span>
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}