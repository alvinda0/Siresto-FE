"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const DeleteProductModal = ({
  isOpen,
  onClose,
  product,
}: DeleteProductModalProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productService.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produk berhasil dihapus");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus produk");
    },
  });

  const handleDelete = () => {
    if (product) {
      deleteMutation.mutate(product.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Produk">
      <div className="space-y-4">
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus produk{" "}
          <span className="font-semibold">{product?.name}</span>?
        </p>
        <p className="text-sm text-red-600">
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
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
};
