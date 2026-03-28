"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthMe } from "@/hooks/useAuthMe";
import { orderService } from "@/services/order.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const { data: user, isLoading: userLoading } = useAuthMe();

  const {
    data: order,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!user && !!orderId,
  });

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
        title="Failed to load order"
        description={error?.message || "An error occurred"}
      />
    );
  }

  if (!order) {
    return (
      <ErrorState
        code={404}
        title="Order not found"
        description="The order you're looking for doesn't exist"
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string; color: string }> = {
      PENDING: { variant: "secondary", label: "Pending", color: "bg-yellow-500" },
      CONFIRMED: { variant: "default", label: "Confirmed", color: "bg-blue-500" },
      PREPARING: { variant: "default", label: "Preparing", color: "bg-orange-500" },
      READY: { variant: "default", label: "Ready", color: "bg-purple-500" },
      SERVED: { variant: "default", label: "Served", color: "bg-green-500" },
      COMPLETED: { variant: "default", label: "Completed", color: "bg-green-600" },
      CANCELLED: { variant: "destructive", label: "Cancelled", color: "bg-red-500" },
    };

    const statusInfo = statusMap[status] || { variant: "secondary", label: status, color: "bg-gray-500" };
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getOrderMethodBadge = (method: string) => {
    const methodMap: Record<string, { label: string; color: string }> = {
      DINE_IN: { label: "Dine In", color: "bg-blue-100 text-blue-800" },
      TAKE_AWAY: { label: "Take Away", color: "bg-green-100 text-green-800" },
      DELIVERY: { label: "Delivery", color: "bg-purple-100 text-purple-800" },
    };
    const methodInfo = methodMap[method] || { label: method, color: "bg-gray-100 text-gray-800" };
    return (
      <Badge variant="outline" className={methodInfo.color}>
        {methodInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detail Order</h1>
          <p className="text-gray-600 mt-1">
            Order ID: <span className="font-mono">{order.id}</span>
          </p>
        </div>
        <div>
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatCurrency(item.price)}
                        </p>
                        {item.note && (
                          <p className="text-sm text-gray-600 italic mt-1">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.subtotal || 0)}</p>
                      </div>
                    </div>
                    {index < order.order_items.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Catatan Order
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer & Order Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Nama</p>
                  <p className="font-medium">{order.customer_name || "-"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="font-medium">{order.customer_phone || "-"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Nomor Meja</p>
                  <p className="font-medium">{order.table_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detail Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Metode Order</p>
                <div className="mt-1">
                  {getOrderMethodBadge(order.order_method)}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">
                  {getStatusBadge(order.status)}
                </div>
              </div>
              {order.promo_code && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Kode Promo</p>
                    <p className="font-medium font-mono">{order.promo_code}</p>
                  </div>
                </>
              )}
              {order.referral_code && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Kode Referral</p>
                    <p className="font-medium font-mono">{order.referral_code}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Waktu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Dibuat</p>
                <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500">Terakhir Diupdate</p>
                <p className="text-sm font-medium">{formatDate(order.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
