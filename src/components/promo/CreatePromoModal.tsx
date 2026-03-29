'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promoService, CreatePromoRequest } from '@/services/promo.service';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/SelectInput';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface CreatePromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreatePromoModal({ isOpen, onClose, onSuccess }: CreatePromoModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    max_discount: '',
    min_transaction: '',
    quota: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePromoRequest) => promoService.createPromo(data),
    onSuccess: () => {
      toast.success('Promo berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      handleClose();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal membuat promo');
    },
  });

  const handleClose = () => {
    setFormData({
      name: '',
      code: '',
      type: 'percentage',
      value: '',
      max_discount: '',
      min_transaction: '',
      quota: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: CreatePromoRequest = {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      value: Number(formData.value),
      max_discount: formData.max_discount ? Number(formData.max_discount) : null,
      min_transaction: Number(formData.min_transaction),
      quota: Number(formData.quota),
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    };

    createMutation.mutate(requestData);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Buat Promo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {createMutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {(createMutation.error as any)?.response?.data?.message || 'Gagal membuat promo'}
          </div>
        )}

        <div>
          <Label htmlFor="name">Nama Promo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="code">Kode Promo</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />
        </div>

        <div>
          <Label htmlFor="type">Tipe Diskon</Label>
          <SelectInput
            data={[
              { value: 'percentage', label: 'Persentase' },
              { value: 'fixed', label: 'Nominal Tetap' },
            ]}
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as 'percentage' | 'fixed' })}
            valueKey="value"
            labelKey="label"
            placeholder="Pilih tipe diskon"
          />
        </div>

        <div>
          <Label htmlFor="value">
            {formData.type === 'percentage' ? 'Persentase (%)' : 'Jumlah (Rp)'}
          </Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
        </div>

        {formData.type === 'percentage' && (
          <div>
            <Label htmlFor="max_discount">Diskon Maksimal (Rp)</Label>
            <Input
              id="max_discount"
              type="number"
              value={formData.max_discount}
              onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
              placeholder="Opsional"
            />
          </div>
        )}

        <div>
          <Label htmlFor="min_transaction">Transaksi Minimal (Rp)</Label>
          <Input
            id="min_transaction"
            type="number"
            value={formData.min_transaction}
            onChange={(e) => setFormData({ ...formData, min_transaction: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="quota">Kuota</Label>
          <Input
            id="quota"
            type="number"
            value={formData.quota}
            onChange={(e) => setFormData({ ...formData, quota: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="start_date">Tanggal Mulai</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="end_date">Tanggal Berakhir</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Aktifkan promo
          </Label>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Membuat...' : 'Buat Promo'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
