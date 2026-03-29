// components/order/OrderDetailModal.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  User,
  Phone,
  MapPin,
  FileText,
  Calendar,
} from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { orderService } from "@/services/order.service";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
}

const OrderDetailModal = ({ isOpen, onClose, orderId }: OrderDetailModalProps) => {
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrderById(orderId!),
    enabled: !!orderId && isOpen,
  });

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

  if (!orderId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Order</DialogTitle>
          {order && (
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono">{order.id}</span>
            </p>
          )}
        </DialogHeader>

        {isLoading ? (
          <LoadingState message="Loading order details..." submessage="Please wait" fullScreen={false} />
        ) : order ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Status Order</span>
                {getStatusBadge(order.status)}
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="h-5 w-5" />
                  <h3 className="font-semibold">Order Items</h3>
                </div>
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
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

                  <Separator className="my-4" />

                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium">{formatCurrency(order.subtotal_amount)}</p>
                  </div>

                  {/* Promo/Discount */}
                  {order.promo_details && order.discount_amount && order.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-green-600 font-medium">
                          Diskon - {order.promo_details.promo_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.promo_details.promo_type === 'percentage' 
                            ? `${order.promo_details.promo_value}%` 
                            : `Rp ${order.promo_details.promo_value.toLocaleString()}`}
                        </p>
                      </div>
                      <p className="font-medium text-green-600">
                        -{formatCurrency(order.discount_amount)}
                      </p>
                    </div>
                  )}

                  {/* Tax Details */}
                  {order.tax_details && order.tax_details.length > 0 && (
                    <>
                      {order.tax_details.map((tax, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <p className="text-gray-600">
                            {tax.tax_name} ({tax.percentage}%)
                          </p>
                          <p className="font-medium">{formatCurrency(tax.tax_amount)}</p>
                        </div>
                      ))}
                      <Separator className="my-2" />
                    </>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5" />
                  <h3 className="font-semibold">Detail Order</h3>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Metode Order</p>
                    <div className="mt-1">
                      {getOrderMethodBadge(order.order_method)}
                    </div>
                  </div>
                  {order.promo_code && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Kode Promo</p>
                        <div className="mt-1">
                          <p className="font-medium font-mono">{order.promo_code}</p>
                          {order.promo_details && (
                            <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                              <p className="text-sm font-medium text-green-800">
                                {order.promo_details.promo_name}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                Diskon: {order.promo_details.promo_type === 'percentage' 
                                  ? `${order.promo_details.promo_value}%` 
                                  : formatCurrency(order.promo_details.promo_value)}
                              </p>
                              {order.promo_details.max_discount && (
                                <p className="text-xs text-gray-600">
                                  Max: {formatCurrency(order.promo_details.max_discount)}
                                </p>
                              )}
                              <p className="text-xs text-gray-600">
                                Min. Transaksi: {formatCurrency(order.promo_details.min_transaction)}
                              </p>
                            </div>
                          )}
                        </div>
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
                  {order.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500">Catatan</p>
                        <p className="text-gray-700">{order.notes}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5" />
                  <h3 className="font-semibold">Informasi Customer</h3>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Nama</p>
                      <p className="font-medium">{order.customer_name || "-"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Telepon</p>
                      <p className="font-medium">{order.customer_phone || "-"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Nomor Meja</p>
                      <p className="font-medium">{order.table_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5" />
                  <h3 className="font-semibold">Waktu</h3>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Dibuat</p>
                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-500">Terakhir Diupdate</p>
                    <p className="text-sm font-medium">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-600">Order tidak ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
