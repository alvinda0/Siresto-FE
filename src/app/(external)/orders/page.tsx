"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { orderService } from "@/services/order.service";
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
import { ShoppingCart, Plus, RefreshCw, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Trash2 } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Order, WebSocketOrderMessage } from "@/types/order";
import OrderDetailModal from "@/components/order/OrderDetailModal";
import { DeleteOrderModal } from "@/components/order/DeleteOrderModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OrdersListPage = () => {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // WebSocket Filters
  const [wsStatusFilter, setWsStatusFilter] = useState<string>("");
  const [wsMethodFilter, setWsMethodFilter] = useState<string>("");
  const [wsCustomerFilter, setWsCustomerFilter] = useState<string>("");
  const [wsOrderIdFilter, setWsOrderIdFilter] = useState<string>("");
  
  // API Filters (same as WebSocket filters)
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [methodFilter, setMethodFilter] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("");
  const [orderIdFilter, setOrderIdFilter] = useState<string>("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const {
    data: orderResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", page, limit, statusFilter, methodFilter, customerFilter, orderIdFilter],
    queryFn: () => orderService.getOrders({ 
      page, 
      limit,
      ...(statusFilter && { status: statusFilter }),
      ...(methodFilter && { method: methodFilter }),
      ...(customerFilter && { customer: customerFilter }),
      ...(orderIdFilter && { order_id: orderIdFilter }),
    }),
    enabled: !!user,
  });

  useEffect(() => {
    if (orderResponse?.data) {
      setOrders(orderResponse.data);
    } else if (orderResponse?.data === null) {
      // Clear orders when API returns null
      setOrders([]);
    }
  }, [orderResponse]);

  // WebSocket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found for WebSocket connection");
      return;
    }

    // Build WebSocket URL with filters
    const backendUrl = process.env.NEXT_PUBLIC_BACK_END_URL || "http://localhost:8080";
    const params = new URLSearchParams({ token });
    
    // Add filters if they exist
    if (wsStatusFilter) params.append("status", wsStatusFilter);
    if (wsMethodFilter) params.append("method", wsMethodFilter);
    if (wsCustomerFilter) params.append("customer", wsCustomerFilter);
    if (wsOrderIdFilter) params.append("order_id", wsOrderIdFilter);
    
    const wsUrl = backendUrl.replace(/^http/, "ws") + `/api/v1/ws/orders?${params.toString()}`;

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketOrderMessage = JSON.parse(event.data);
          console.log("📨 WebSocket message:", message);

          if (message.type === "order") {
            if (message.action === "created") {
              setOrders((prev) => [message.data, ...prev]);
            } else if (message.action === "updated") {
              setOrders((prev) =>
                prev.map((order) =>
                  order.id === message.data.id ? message.data : order
                )
              );
            } else if (message.action === "deleted") {
              setOrders((prev) =>
                prev.filter((order) => order.id !== message.data.id)
              );
            }
          }
        } catch (err) {
          console.error("❌ Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        // Silently handle WebSocket errors - backend might not be running
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        setWsConnected(false);
        
        // Only attempt reconnect if it was an unexpected close
        if (event.code !== 1000 && event.code !== 1001) {
          // Don't reload, just stay disconnected
          console.log("WebSocket disconnected - real-time updates unavailable");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      // Silently handle connection errors
      setWsConnected(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, [user, wsStatusFilter, wsMethodFilter, wsCustomerFilter, wsOrderIdFilter]);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role.type !== "EXTERNAL") {
      router.push("/dashboard");
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
        title="Failed to load orders"
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
      PREPARING: { variant: "default", label: "Preparing" },
      READY: { variant: "default", label: "Ready" },
      SERVED: { variant: "default", label: "Served" },
      COMPLETED: { variant: "default", label: "Completed" },
      CANCELLED: { variant: "destructive", label: "Cancelled" },
    };

    const statusInfo = statusMap[status] || { variant: "secondary", label: status };
    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getOrderMethodBadge = (method: string) => {
    const methodMap: Record<string, string> = {
      DINE_IN: "Dine In",
      TAKE_AWAY: "Take Away",
      DELIVERY: "Delivery",
    };
    return methodMap[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Main Search Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <Input
                  placeholder="Search by customer or order ID..."
                  value={customerFilter}
                  onChange={(e) => {
                    setCustomerFilter(e.target.value);
                    setWsCustomerFilter(e.target.value);
                  }}
                  className="w-full"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter || undefined} onValueChange={(value) => {
                  const newValue = value === "ALL" ? "" : value;
                  setStatusFilter(newValue);
                  setWsStatusFilter(newValue);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PREPARING">Preparing</SelectItem>
                    <SelectItem value="READY">Ready</SelectItem>
                    <SelectItem value="SERVED">Served</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-3">
                <label className="text-sm font-medium mb-2 block">Method</label>
                <Select value={methodFilter || undefined} onValueChange={(value) => {
                  const newValue = value === "ALL" ? "" : value;
                  setMethodFilter(newValue);
                  setWsMethodFilter(newValue);
                }}>
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

              <div className="md:col-span-2 flex items-end gap-2">
                <Button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Apply
                </Button>
                {(statusFilter || methodFilter || customerFilter || orderIdFilter) && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setStatusFilter("");
                      setMethodFilter("");
                      setCustomerFilter("");
                      setOrderIdFilter("");
                      setWsStatusFilter("");
                      setWsMethodFilter("");
                      setWsCustomerFilter("");
                      setWsOrderIdFilter("");
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {(statusFilter || methodFilter || customerFilter || orderIdFilter) && (
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                <span className="text-sm text-gray-500">Active filters:</span>
                {statusFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {statusFilter}
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setWsStatusFilter("");
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {methodFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Method: {methodFilter.replace('_', ' ')}
                    <button
                      onClick={() => {
                        setMethodFilter("");
                        setWsMethodFilter("");
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {customerFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Customer: {customerFilter}
                    <button
                      onClick={() => {
                        setCustomerFilter("");
                        setWsCustomerFilter("");
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {orderIdFilter && (
                  <Badge variant="secondary" className="gap-1">
                    Order ID: {orderIdFilter}
                    <button
                      onClick={() => {
                        setOrderIdFilter("");
                        setWsOrderIdFilter("");
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Semua Order ({orderResponse?.meta?.total_items || 0})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm font-medium text-gray-600">
                {wsConnected ? "Real-time Updates Active" : "Real-time Updates Disconnected"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada order</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] pl-6">Order ID</TableHead>
                      <TableHead className="w-[100px]">Meja</TableHead>
                      <TableHead className="w-[150px]">Customer</TableHead>
                      <TableHead className="w-[120px]">Metode</TableHead>
                      <TableHead className="w-[200px]">Items</TableHead>
                      <TableHead className="w-[120px]">Total</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[150px]">Waktu</TableHead>
                      <TableHead className="w-[100px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="pl-6 font-mono text-xs">
                          {order.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.table_number}
                        </TableCell>
                        <TableCell>
                          {order.customer_name || "-"}
                          {order.customer_phone && (
                            <div className="text-xs text-gray-500">
                              {order.customer_phone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getOrderMethodBadge(order.order_method)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {order.order_items.map((item, idx) => (
                              <div key={idx} className="text-xs">
                                {item.quantity}x {item.product?.name || item.product_name || "Product"}
                                {item.note && (
                                  <span className="text-gray-500 italic"> ({item.note})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setIsDetailModalOpen(true);
                              }}
                            >
                              Detail
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeletingOrderId(order.id);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {orderResponse?.meta && (
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
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-600">
                      {((page - 1) * limit) + 1}-{Math.min(page * limit, orderResponse.meta.total_items)} dari {orderResponse.meta.total_items}
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
                        disabled={page === (orderResponse.meta?.total_pages || 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(orderResponse.meta?.total_pages || 1)}
                        disabled={page === (orderResponse.meta?.total_pages || 1)}
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

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />

      {/* Delete Order Modal */}
      <DeleteOrderModal
        isOpen={isDeleteModalOpen}
        orderId={deletingOrderId}
        orderNumber={orders.find(o => o.id === deletingOrderId)?.id.substring(0, 8)}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingOrderId(null);
        }}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default OrdersListPage;
