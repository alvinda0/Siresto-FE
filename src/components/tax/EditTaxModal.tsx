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
import { taxService } from "@/services/tax.service";
import { Tax } from "@/types/tax";
import { toast } from "sonner";

interface EditTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
}

export function EditTaxModal({
  isOpen,
  onClose,
  tax,
}: EditTaxModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nama_pajak: "",
    tipe_pajak: "",
    presentase: 0,
    deskripsi: "",
    status: "active",
    prioritas: 1,
  });

  useEffect(() => {
    if (tax) {
      setFormData({
        nama_pajak: tax.nama_pajak,
        tipe_pajak: tax.tipe_pajak,
        presentase: tax.presentase,
        deskripsi: tax.deskripsi || "",
        status: tax.status,
        prioritas: tax.prioritas,
      });
    }
  }, [tax]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      taxService.updateTax(tax?.id || "", data),
    onSuccess: () => {
      toast.success("Pajak berhasil diupdate");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal mengupdate pajak");
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
      [name]: name === "presentase" || name === "prioritas" ? parseFloat(value) : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Pajak" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nama_pajak">Nama Pajak</Label>
          <Input
            id="nama_pajak"
            name="nama_pajak"
            value={formData.nama_pajak}
            onChange={handleChange}
            placeholder="e.g., PB1"
            required
          />
        </div>

        <div>
          <Label htmlFor="tipe_pajak">Tipe Pajak</Label>
          <Select
            value={formData.tipe_pajak}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, tipe_pajak: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe pajak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pb1">PB1</SelectItem>
              <SelectItem value="sc">Service Charge</SelectItem>
              <SelectItem value="ppn">PPN</SelectItem>
              <SelectItem value="other">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="presentase">Persentase (%)</Label>
          <Input
            id="presentase"
            name="presentase"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.presentase}
            onChange={handleChange}
            placeholder="e.g., 10"
            required
          />
        </div>

        <div>
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder="Deskripsi pajak"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="prioritas">Prioritas</Label>
          <Input
            id="prioritas"
            name="prioritas"
            type="number"
            min="1"
            value={formData.prioritas}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
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
