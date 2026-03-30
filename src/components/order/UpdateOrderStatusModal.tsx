"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  currentStatus: string;
  onSuccess?: () => void;
}

export function UpdateOrderStatusModal({
  isOpen,
  onClose,
  orderId,
  currentStatus,
  onSuccess,
}: UpdateOrderStatusModalProps) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: () => {
      if (!orderId) throw new Error("Order ID is required");
      return orderService.updateOrderStatus(orderId, "PROCESSING");
    },
    onSuccess: () => {
      toast.success("Status order berhasil diubah ke Processing");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      if (orderId) {
        queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      }
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal memperbarui status order");
    },
  });

  const handleSubmit = () => {
    updateStatusMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status ke Processing</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin mengubah status order ini menjadi <strong>Processing</strong>?
            <br />
            Status saat ini: <strong>{currentStatus}</strong>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={updateStatusMutation.isPending}
          >
            {updateStatusMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Ya, Update ke Processing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
