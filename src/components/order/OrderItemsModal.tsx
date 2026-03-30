"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderItemDetail } from "@/types/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrderItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItemDetail[];
  orderId: string;
}

export function OrderItemsModal({
  isOpen,
  onClose,
  items,
  orderId,
}: OrderItemsModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Items Order</DialogTitle>
          <DialogDescription>
            Order ID: <span className="font-mono">{orderId.substring(0, 8)}...</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {item.product?.name || item.product_name || "Product"}
                      </div>
                      {item.note && (
                        <div className="text-xs text-gray-500 italic mt-1">
                          Note: {item.note}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item.quantity}x
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {items.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Tidak ada item
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
