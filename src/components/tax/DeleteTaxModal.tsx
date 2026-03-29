"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { taxService } from "@/services/tax.service";
import { Tax } from "@/types/tax";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
}

export function DeleteTaxModal({
  isOpen,
  onClose,
  tax,
}: DeleteTaxModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => taxService.deleteTax(id),
    onSuccess: () => {
      toast.success("Pajak berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus pajak");
    },
  });

  const handleDelete = () => {
    if (tax?.id) {
      deleteMutation.mutate(tax.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Pajak" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus pajak{" "}
              <span className="font-semibold text-gray-900">{tax?.nama_pajak}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
