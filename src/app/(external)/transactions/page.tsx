"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { reportService } from "@/services/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Filter, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, RefreshCw, X, ChevronDown } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ReportsPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  
  // Filters (temporary state)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderMethod, setOrderMethod] = useState("");

  // Applied filters (used in query)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    search: "",
    status: "",
    paymentStatus: "",
    paymentMethod: "",
    orderMethod: "",
  });

  // Advanced filters toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    data: reportResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["transaction-reports", page, limit, appliedFilters],
    queryFn: () => reportService.getTransactionReports({
      page,
      limit,
      ...(appliedFilters.startDate && { start_date: appliedFilters.startDate }),
      ...(appliedFilters.endDate && { end_date: appliedFilters.endDate }),
      ...(appliedFilters.startTime && { start_time: appliedFilters.startTime }),
      ...(appliedFilters.endTime && { end_time: appliedFilters.endTime }),
      ...(appliedFilters.search && { search: appliedFilters.search }),
      ...(appliedFilters.status && { status: appliedFilters.status }),
      ...(appliedFilters.paymentStatus && { payment_status: appliedFilters.paymentStatus }),
      ...(appliedFilters.paymentMethod && { payment_method: appliedFilters.paymentMethod }),
      ...(appliedFilters.orderMethod && { order_method: appliedFilters.orderMethod }),
    }),
    enabled: !!user,
  });

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.type !== "EXTERNAL") {
      router.push("/dashboard");
      return;
    }

    // Check if user is owner or admin (case-insensitive)
    const roleName = user.role.name.toLowerCase();
    if (roleName !== "owner" && roleName !== "admin") {
      router.push("/home");
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <LoadingState />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        code={500}
        title="Failed to load reports"
        description={error?.message || "An error occurred"}
      />
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: "secondary", label: "Pending" },
      CONFIRMED: { variant: "default", label: "Confirmed" },
      PROCESSING: { variant: "default", label: "Processing" },
      READY: { variant: "default", label: "Ready" },
      SERVED: { variant: "default", label: "Served" },
      COMPLETED: { variant: "default", label: "Completed" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    };

    const statusInfo = statusMap[status] || { variant: "secondary", label: status };
    
    if (status === "COMPLETED") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          {statusInfo.label}
        </Badge>
      );
    }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      PAID: { variant: "default", label: "Paid" },
      UNPAID: { variant: "secondary", label: "Unpaid" },
      PARTIAL: { variant: "secondary", label: "Partial" },
    };

    const statusInfo = statusMap[paymentStatus] || { variant: "secondary", label: paymentStatus };
    
    if (paymentStatus === "PAID") {
      return (
        <Badge className="bg-green-600 hover:bg-green-700 text-white">
          {statusInfo.label}
        </Badge>
      );
    }
    
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStartTime("");
    setEndTime("");
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPaymentMethod("");
    setOrderMethod("");
    setAppliedFilters({
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      search: "",
      status: "",
      paymentStatus: "",
      paymentMethod: "",
      orderMethod: "",
    });
    setPage(1);
  };

  const applyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      startTime,
      endTime,
      search,
      status,
      paymentStatus,
      paymentMethod,
      orderMethod,
    });
    setPage(1);
  };

  const hasActiveFilters = startDate || endDate || startTime || endTime || search || status || paymentStatus || paymentMethod || orderMethod;

  const reports = reportResponse?.data || [];

  // Calculate summary
  const summary = {
    totalTransactions: reportResponse?.meta?.total_items || 0,
    totalRevenue: reports.reduce((sum, r) => sum + r.total_amount, 0),
    totalPaid: reports.reduce((sum, r) => sum + r.paid_amount, 0),
    totalDiscount: reports.reduce((sum, r) => sum + r.discount_amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Terbayar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Diskon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(summary.totalDiscount)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          </div>

          {/* Single Row Inline Filters */}
          <div className="grid grid-cols-12 gap-3 items-end">
            {/* Search - 3 cols */}
            <div className="col-span-3">
              <label className="text-sm font-medium mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                  placeholder="Search by customer name..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Order Status - 2 cols */}
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Order Status</label>
              <Select value={status || "ALL"} onValueChange={(value) => setStatus(value === "ALL" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status - 2 cols */}
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Payment Status</label>
              <Select value={paymentStatus || "ALL"} onValueChange={(value) => setPaymentStatus(value === "ALL" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Payment</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spacer - 1 col */}
            <div className="col-span-1"></div>

            {/* Apply Button - 1 col */}
            <div className="col-span-1">
              <Button
                onClick={applyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg w-full h-10 px-6"
              >
                Apply
              </Button>
            </div>

            {/* Advanced Button - 2 cols */}
            <div className="col-span-2">
              <Button
                onClick={() => setShowAdvanced(!showAdvanced)}
                variant="outline"
                className="bg-blue-500/10 hover:bg-blue-500/20 border-blue-200 text-blue-700 w-full h-10 px-4"
              >
                <Filter className="w-4 h-4" />
                <span className="mx-2">Advanced</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* Clear Button - 1 col */}
            <div className="col-span-1">
              <Button
                onClick={clearFilters}
                variant="outline"
                disabled={!hasActiveFilters}
                className="bg-red-500/20 hover:bg-red-500/30 border-red-200 text-red-700 w-full h-10 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4" />
                <span className="ml-2">Clear</span>
              </Button>
            </div>
          </div>

          {/* Advanced Filters - Toggle visibility */}
          {showAdvanced && (
            <div className="grid grid-cols-12 gap-3 items-end pt-4 mt-4 border-t">
              {/* Start Date */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Start Time */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* End Time */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Payment Method</label>
                <Select value={paymentMethod || "ALL"} onValueChange={(value) => setPaymentMethod(value === "ALL" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="TUNAI">Tunai</SelectItem>
                    <SelectItem value="DEBIT">Debit</SelectItem>
                    <SelectItem value="QRIS">QRIS</SelectItem>
                    <SelectItem value="GOPAY">GoPay</SelectItem>
                    <SelectItem value="OVO">OVO</SelectItem>
                    <SelectItem value="COMPLIMENTARY">Complimentary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Order Method */}
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Order Method</label>
                <Select value={orderMethod || "ALL"} onValueChange={(value) => setOrderMethod(value === "ALL" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Methods</SelectItem>
                    <SelectItem value="DINE_IN">Dine In</SelectItem>
                    <SelectItem value="TAKE_AWAY">Take Away</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-4 mt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <button onClick={() => setSearch("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {startDate && (
                <Badge variant="secondary" className="gap-1">
                  From: {startDate}
                  <button onClick={() => setStartDate("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {endDate && (
                <Badge variant="secondary" className="gap-1">
                  To: {endDate}
                  <button onClick={() => setEndDate("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {startTime && (
                <Badge variant="secondary" className="gap-1">
                  Time From: {startTime}
                  <button onClick={() => setStartTime("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {endTime && (
                <Badge variant="secondary" className="gap-1">
                  Time To: {endTime}
                  <button onClick={() => setEndTime("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {status}
                  <button onClick={() => setStatus("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {paymentStatus && (
                <Badge variant="secondary" className="gap-1">
                  Payment: {paymentStatus}
                  <button onClick={() => setPaymentStatus("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {paymentMethod && (
                <Badge variant="secondary" className="gap-1">
                  Method: {paymentMethod}
                  <button onClick={() => setPaymentMethod("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
              {orderMethod && (
                <Badge variant="secondary" className="gap-1">
                  Order: {orderMethod.replace('_', ' ')}
                  <button onClick={() => setOrderMethod("")} className="ml-1 hover:text-red-600">×</button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Laporan Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada data transaksi</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Order Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Meja</TableHead>
                      <TableHead>Metode Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Status Bayar</TableHead>
                      <TableHead>Metode Bayar</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">Pajak</TableHead>
                      <TableHead className="text-right">Diskon</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Terbayar</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Cabang</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="pl-6 font-mono text-xs">
                          {report.order_number}
                        </TableCell>
                        <TableCell>
                          {report.customer_name || "-"}
                          {report.customer_phone && (
                            <div className="text-xs text-gray-500">
                              {report.customer_phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{report.table_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {report.order_method.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(report.payment_status)}</TableCell>
                        <TableCell>{report.payment_method || "-"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(report.subtotal_amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(report.tax_amount)}</TableCell>
                        <TableCell className="text-right text-orange-600">
                          {report.discount_amount > 0 ? `-${formatCurrency(report.discount_amount)}` : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(report.total_amount)}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(report.paid_amount)}
                        </TableCell>
                        <TableCell className="text-xs">
                          {formatDate(report.created_at)}
                          {report.paid_at && (
                            <div className="text-gray-500">
                              Bayar: {formatDate(report.paid_at)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {report.branch_name}
                          <div className="text-gray-500">{report.company_name}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {reportResponse?.meta && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Baris per halaman:</span>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(Number(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, reportResponse.meta.total_items)} dari {reportResponse.meta.total_items}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(page + 1)}
                        disabled={page === (reportResponse.meta?.total_pages || 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(reportResponse.meta?.total_pages || 1)}
                        disabled={page === (reportResponse.meta?.total_pages || 1)}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
