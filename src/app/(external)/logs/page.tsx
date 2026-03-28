// app/(external)/logs/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookDashed, Activity, AlertCircle, CheckCircle, Eye } from "lucide-react";
import CustomDataTable from "@/components/CustomDataTable";
import { auditService } from "@/services/audit.service";
import { AuditLog } from "@/types/audit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import AuditLogDetailModal from "@/components/audit/AuditLogDetailModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ExternalLogsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [methodFilter, setMethodFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, limit, methodFilter],
    queryFn: () => auditService.getAuditLogs({ 
      page, 
      limit,
      ...(methodFilter && { method: methodFilter })
    }),
  });

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "bg-green-500";
    if (statusCode >= 400 && statusCode < 500) return "bg-yellow-500";
    if (statusCode >= 500) return "bg-red-500";
    return "bg-gray-500";
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-500";
      case "POST": return "bg-green-500";
      case "PUT": return "bg-yellow-500";
      case "DELETE": return "bg-red-500";
      case "PATCH": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const successCount = data?.data.filter(log => log.status_code >= 200 && log.status_code < 300).length || 0;
  const failedCount = data?.data.filter(log => log.status_code >= 400).length || 0;

  const columns = [
    {
      name: "Method",
      selector: (row: AuditLog) => row.method,
      cell: (row: AuditLog) => (
        <Badge className={`${getMethodColor(row.method)} text-white`}>
          {row.method}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Path",
      selector: (row: AuditLog) => row.path,
      cell: (row: AuditLog) => (
        <span className="font-mono text-xs">{row.path}</span>
      ),
      grow: 2,
    },
    {
      name: "Status",
      selector: (row: AuditLog) => row.status_code,
      cell: (row: AuditLog) => (
        <Badge className={`${getStatusColor(row.status_code)} text-white`}>
          {row.status_code}
        </Badge>
      ),
      width: "100px",
    },
    {
      name: "Response Time",
      selector: (row: AuditLog) => row.response_time,
      cell: (row: AuditLog) => <span>{row.response_time}ms</span>,
      width: "130px",
    },
    {
      name: "IP Address",
      selector: (row: AuditLog) => row.ip_address,
      cell: (row: AuditLog) => (
        <span className="font-mono text-xs">{row.ip_address}</span>
      ),
      width: "140px",
    },
    {
      name: "Access From",
      selector: (row: AuditLog) => row.access_from,
      cell: (row: AuditLog) => (
        <span className="capitalize">{row.access_from}</span>
      ),
      width: "120px",
    },
    {
      name: "Created At",
      selector: (row: AuditLog) => row.created_at,
      cell: (row: AuditLog) => (
        <span className="text-xs">
          {format(new Date(row.created_at), "MMM dd, yyyy HH:mm")}
        </span>
      ),
      width: "160px",
    },
    {
      name: "Actions",
      cell: (row: AuditLog) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(row)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
      width: "80px",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-gray-500 mt-1">Track all your system activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.meta.total_items || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Page</CardTitle>
            <BookDashed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.data.length || 0}</div>
            <p className="text-xs text-muted-foreground">Activities on this page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successCount}</div>
            <p className="text-xs text-muted-foreground">Successful actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCount}</div>
            <p className="text-xs text-muted-foreground">Failed actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={methodFilter || undefined} onValueChange={(value) => setMethodFilter(value === "ALL" ? "" : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log Table */}
      <CustomDataTable
        title="Activity Logs"
        description="View all your system activity logs"
        columns={columns}
        data={data?.data || []}
        progressPending={isLoading}
        pagination
        paginationServer
        paginationTotalRows={data?.meta.total_items || 0}
        paginationPerPage={limit}
        paginationRowsPerPageOptions={[10, 20, 30, 50]}
        onChangePage={setPage}
        onChangeRowsPerPage={(newLimit: number) => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      {/* Detail Modal */}
      <AuditLogDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default ExternalLogsPage;
