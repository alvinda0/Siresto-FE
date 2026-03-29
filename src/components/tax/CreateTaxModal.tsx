"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { companyService } from "@/services/company.service";
import { toast } from "sonner";

interface CreateTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTaxModal({
  isOpen,
  onClose,
}: CreateTaxModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    company_id: "",
    branch_id: "",
    nama_pajak: "",
    tipe_pajak: "pb1",
    presentase: 0,
    deskripsi: "",
    status: "active",
    prioritas: 1,
  });

  // Get companies
  const { data: companies } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.getMyCompanies(),
    enabled: isOpen,
  });

  // Get branches when company is selected
  const { data: branchResponse } = useQuery({
    queryKey: ["branches", formData.company_id],
    queryFn: () => companyService.getBranchesByCompanyId(formData.company_id),
    enabled: !!formData.company_id && isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const payload: any = {
        company_id: data.company_id,
        nama_pajak: data.nama_pajak,
        tipe_pajak: data.tipe_pajak,
        presentase: data.presentase,
        deskripsi: data.deskripsi,
        status: data.status,
        prioritas: data.prioritas,
      };
      
      // Only include branch_id if it's selected
      if (data.branch_id) {
        payload.branch_id = data.branch_id;
      }
      
      return taxService.createTax(payload);
    },
    onSuccess: () => {
      toast.success("Pajak berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: ["taxes"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal membuat pajak");
    },
  });

  const handleClose = () => {
    setFormData({
      company_id: "",
      branch_id: "",
      nama_pajak: "",
      tipe_pajak: "pb1",
      presentase: 0,
      deskripsi: "",
      status: "active",
      prioritas: 1,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company_id) {
      toast.error("Pilih perusahaan terlebih dahulu");
      return;
    }
    
    createMutation.mutate(formData);
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

  const branches = branchResponse?.data || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tambah Pajak" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="company_id">Perusahaan</Label>
          <Select
            value={formData.company_id}
            onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, company_id: value, branch_id: "" }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih perusahaan" />
            </SelectTrigger>
            <SelectContent>
              {companies?.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.company_id && branches.length > 0 && (
          <div>
            <Label htmlFor="branch_id">Cabang (Opsional)</Label>
            <Select
              value={formData.branch_id || undefined}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, branch_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih cabang (kosongkan untuk company level)" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Kosongkan untuk membuat pajak di level perusahaan
            </p>
          </div>
        )}

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
            disabled={createMutation.isPending}
          >
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Membuat..." : "Buat Pajak"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
