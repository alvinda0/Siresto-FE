"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  branchId: string;
  companyId: string;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  category,
  branchId,
  companyId,
}: DeleteCategoryModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["categories", branchId, companyId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menghapus kategori");
    },
  });

  const handleDelete = () => {
    if (category?.id) {
      deleteMutation.mutate(category.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Kategori" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus kategori{" "}
              <span className="font-semibold text-gray-900">{category?.name}</span>?
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
