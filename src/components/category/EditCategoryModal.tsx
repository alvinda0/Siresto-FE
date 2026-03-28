"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { toast } from "sonner";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  branchId: string;
  companyId: string;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
  branchId,
  companyId,
}: EditCategoryModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    position: 1,
    is_active: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        position: category.position,
        is_active: category.is_active,
      });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      categoryService.updateCategory(category?.id || "", data),
    onSuccess: () => {
      toast.success("Kategori berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["categories", branchId, companyId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal mengupdate kategori");
    },
  });

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "position" ? parseInt(value) : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Kategori" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Nama Kategori</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Makanan"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi kategori"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="position">Posisi</Label>
          <Input
            id="position"
            name="position"
            type="number"
            min="1"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="is_active">Status</Label>
          <Select
            value={formData.is_active ? "true" : "false"}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, is_active: value === "true" }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
