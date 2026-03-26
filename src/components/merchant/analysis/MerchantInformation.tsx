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
interface MerchantData {
  merchantName: string;
  merchantId: string;
  assignedAgent: string;
  dailyVolume: number;
  utilization: number;
  status: "HEALTHY" | "NEED ATTENTION" | "OVER CAPACITY";
}

type SortField =
  | "merchantName"
  | "assignedAgent"
  | "dailyVolume"
  | "utilization"
  | "status";
type SortOrder = "asc" | "desc";

interface MerchantInformationProps {
  merchantData: MerchantData[];
  isLoading: boolean;
  selectedDate: string;
}

export default function MerchantInformation({
  merchantData,
  isLoading,
  selectedDate,
}: MerchantInformationProps) {
  const [sortField, setSortField] = useState<SortField>("dailyVolume");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // ==================== UTILITY FUNCTIONS ====================

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
    data: MerchantData[],
    field: SortField,
    order: SortOrder,
  ): MerchantData[] => {
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
      "Merchant Name",
      "Assigned Agent",
      "Daily Volume",
      "Utilization %",
      "Status",
    ];
    const rows = merchantData.map((m) => [
      m.merchantName,
      m.assignedAgent,
      m.dailyVolume.toString(),
      m.utilization.toFixed(1),
      m.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merchant-information-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Data berhasil diexport ke CSV");
  };

  // Get sorted data
  const sortedData = sortData(merchantData, sortField, sortOrder);

  // ==================== RENDER ====================

  return (
    <Card className="w-full overflow-hidden gap-0">
      <CardHeader className="border-b border-gray-200/50 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Merchant Information
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Transaction data for {formatDate(selectedDate)}
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
              disabled={merchantData.length === 0}
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
                    onClick={() => handleSort("merchantName")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "merchantName" ? "text-blue-600" : ""
                    }`}
                  >
                    Merchant Name
                    {getSortIcon("merchantName")}
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
                    onClick={() => handleSort("assignedAgent")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "assignedAgent" ? "text-blue-600" : ""
                    }`}
                  >
                    Assigned Agent
                    {getSortIcon("assignedAgent")}
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
                    onClick={() => handleSort("dailyVolume")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "dailyVolume" ? "text-blue-600" : ""
                    }`}
                  >
                    Daily Volume
                    {getSortIcon("dailyVolume")}
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
                    onClick={() => handleSort("utilization")}
                    className={`flex items-center gap-2 hover:text-gray-900 transition-colors ${
                      sortField === "utilization" ? "text-blue-600" : ""
                    }`}
                  >
                    Utilization %{getSortIcon("utilization")}
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
                      <Skeleton className="h-5 w-24" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-36" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="p-4">
                      <Skeleton className="h-6 w-24" />
                    </td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No merchant data available for selected date
                  </td>
                </tr>
              ) : (
                sortedData.map((merchant) => (
                  <tr
                    key={merchant.merchantId}
                    className="border-b border-gray-200/30 hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="p-4 text-gray-800 font-medium">
                      {merchant.merchantName}
                    </td>
                    <td className="p-4 text-gray-600">
                      {merchant.assignedAgent}
                    </td>
                    <td className="p-4 text-gray-600 font-mono">
                      {formatCurrency(merchant.dailyVolume)}
                    </td>
                    <td className="p-4 font-semibold text-emerald-600">
                      {formatPercentage(merchant.utilization)}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          merchant.status === "HEALTHY"
                            ? "default"
                            : merchant.status === "OVER CAPACITY"
                              ? "destructive"
                              : "destructive"
                        }
                        className={
                          merchant.status === "HEALTHY"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300"
                            : merchant.status === "OVER CAPACITY"
                              ? "bg-red-600 text-white hover:bg-red-700 border border-red-700"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-300"
                        }
                      >
                        {merchant.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && sortedData.length > 0 && (
          <div className="p-4 bg-gray-50/30 border-t border-gray-200/50">
            <div className="flex justify-between items-center text-sm flex-wrap gap-3">
              <span className="text-gray-600">
                Total Merchants:{" "}
                <span className="font-semibold text-gray-800">
                  {sortedData.length}
                </span>
              </span>
              <span className="text-gray-600">
                Healthy:{" "}
                <span className="font-semibold text-emerald-600">
                  {sortedData.filter((m) => m.status === "HEALTHY").length}
                </span>
              </span>
              <span className="text-gray-600">
                Need Attention:{" "}
                <span className="font-semibold text-orange-600">
                  {
                    sortedData.filter((m) => m.status === "NEED ATTENTION")
                      .length
                  }
                </span>
              </span>
              <span className="text-gray-600">
                Over Capacity:{" "}
                <span className="font-semibold text-red-600">
                  {
                    sortedData.filter((m) => m.status === "OVER CAPACITY")
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
