"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
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
import { toast } from "sonner";
import { CreateProductPayload } from "@/types/product";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: string;
  companyId: string;
}

export const CreateProductModal = ({
  isOpen,
  onClose,
  branchId,
  companyId,
}: CreateProductModalProps) => {
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    branch_id: "",
    category_id: "",
    name: "",
    description: "",
    stock: 0,
    price: 0,
    position: "",
    is_available: true,
  });

  // Update branch_id when branchId prop changes
  useEffect(() => {
    if (branchId) {
      setFormData(prev => ({ ...prev, branch_id: branchId }));
    }
  }, [branchId]);

  // Get categories
  const { data: categoryResponse } = useQuery({
    queryKey: ["categories", branchId, companyId],
    queryFn: () => categoryService.getCategories(branchId, companyId),
    enabled: !!branchId && !!companyId && isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      productService.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produk berhasil ditambahkan");
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal menambahkan produk");
    },
  });

  const resetForm = () => {
    setFormData({
      branch_id: branchId || "",
      category_id: "",
      name: "",
      description: "",
      stock: 0,
      price: 0,
      position: "",
      is_available: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      toast.error("Silakan pilih gambar produk");
      return;
    }
    
    const payload: CreateProductPayload = {
      ...formData,
      branch_id: formData.branch_id || branchId,
      image: imageFile,
    };
    
    createMutation.mutate(payload);
  };

  const categories = categoryResponse?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Produk" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Harga</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Posisi</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            placeholder="Contoh: A1, B2, C3"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Gambar Produk</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
          {imagePreview && (
            <div className="mt-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="is_available">Status Ketersediaan</Label>
          <Select
            value={formData.is_available ? "true" : "false"}
            onValueChange={(value) =>
              setFormData({ ...formData, is_available: value === "true" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Tersedia</SelectItem>
              <SelectItem value="false">Tidak Tersedia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
