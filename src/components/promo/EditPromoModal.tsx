'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { promoService, UpdatePromoRequest } from '@/services/promo.service';
import { productService } from '@/services/product.service';
import type { Promo } from '@/services/promo.service';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectInput } from '@/components/SelectInput';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

interface EditPromoModalProps {
  isOpen: boolean;
  promo: Promo | null;
  onClose: () => void;
  onSuccess: () => void;
}

type PromoCategory = 'normal' | 'product' | 'bundle';

export function EditPromoModal({ isOpen, promo, onClose, onSuccess }: EditPromoModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<PromoCategory>('normal');
  const [formData, setFormData] = useState({
    name: promo?.name || '',
    code: promo?.code || '',
    type: (promo?.type || 'percentage') as 'percentage' | 'fixed',
    value: promo?.value.toString() || '',
    max_discount: promo?.max_discount?.toString() || '',
    min_transaction: promo?.min_transaction?.toString() || '',
    quota: promo?.quota?.toString() || '',
    start_date: promo?.start_date || '',
    end_date: promo?.end_date || '',
    is_active: promo?.is_active ?? true,
    product_ids: [] as string[],
    bundle_items: [] as Array<{ product_id: string; quantity: number }>,
  });

  // Get products for product and bundle promos
  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.getProducts({ limit: 1000 }),
    enabled: isOpen && (activeTab === 'product' || activeTab === 'bundle'),
  });

  const products = productsResponse?.data || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromoRequest }) =>
      promoService.updatePromo(id, data),
    onSuccess: () => {
      toast.success('Promo berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal memperbarui promo');
    },
  });

  useEffect(() => {
    if (isOpen && promo) {
      setActiveTab(promo.promo_category as PromoCategory);
      setFormData({
        name: promo.name,
        code: promo.code,
        type: promo.type,
        value: promo.value.toString(),
        max_discount: promo.max_discount?.toString() || '',
        min_transaction: promo.min_transaction?.toString() || '',
        quota: promo.quota?.toString() || '',
        start_date: promo.start_date,
        end_date: promo.end_date,
        is_active: promo.is_active,
        product_ids: [],
        bundle_items: [],
      });
    }
  }, [isOpen, promo]);

  if (!promo) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!promo) return;

    const baseData = {
      name: formData.name,
      code: formData.code,
      promo_category: activeTab,
      type: formData.type,
      value: Number(formData.value),
      start_date: formData.start_date,
      end_date: formData.end_date,
      is_active: formData.is_active,
    };

    let requestData: UpdatePromoRequest;

    if (activeTab === 'normal') {
      requestData = {
        ...baseData,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        min_transaction: Number(formData.min_transaction),
        quota: Number(formData.quota),
      };
    } else if (activeTab === 'product') {
      if (formData.product_ids.length === 0) {
        toast.error('Pilih minimal 1 produk');
        return;
      }
      requestData = {
        ...baseData,
        product_ids: formData.product_ids,
      };
    } else {
      // bundle
      if (formData.bundle_items.length === 0) {
        toast.error('Tambahkan minimal 1 item bundle');
        return;
      }
      requestData = {
        ...baseData,
        bundle_items: formData.bundle_items,
      };
    }

    updateMutation.mutate({
      id: promo.id,
      data: requestData,
    });
  };

  const addBundleItem = () => {
    setFormData({
      ...formData,
      bundle_items: [...formData.bundle_items, { product_id: '', quantity: 1 }],
    });
  };

  const removeBundleItem = (index: number) => {
    setFormData({
      ...formData,
      bundle_items: formData.bundle_items.filter((_, i) => i !== index),
    });
  };

  const updateBundleItem = (index: number, field: 'product_id' | 'quantity', value: string | number) => {
    const newItems = [...formData.bundle_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, bundle_items: newItems });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Promo" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {updateMutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {(updateMutation.error as any)?.response?.data?.message || 'Gagal memperbarui promo'}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b">
          <button
            type="button"
            className={`px-4 py-2 font-medium ${
              activeTab === 'normal'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('normal')}
          >
            Promo Normal
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium ${
              activeTab === 'product'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('product')}
          >
            Promo Produk
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium ${
              activeTab === 'bundle'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('bundle')}
          >
            Promo Bundle
          </button>
        </div>

        {/* Common Fields */}
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

        {/* Normal Promo Fields */}
        {activeTab === 'normal' && (
          <>
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
          </>
        )}

        {/* Product Promo Fields */}
        {activeTab === 'product' && (
          <div>
            <Label>Pilih Produk</Label>
            <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={formData.product_ids.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          product_ids: [...formData.product_ids, product.id],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          product_ids: formData.product_ids.filter((id) => id !== product.id),
                        });
                      }
                    }}
                  />
                  <Label htmlFor={`product-${product.id}`} className="cursor-pointer flex-1">
                    {product.name} - Rp {product.price.toLocaleString()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bundle Promo Fields */}
        {activeTab === 'bundle' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Item Bundle</Label>
              <Button type="button" size="sm" onClick={addBundleItem}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah Item
              </Button>
            </div>
            <div className="space-y-2">
              {formData.bundle_items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Produk</Label>
                    <SelectInput
                      data={products}
                      value={item.product_id}
                      onChange={(value) => updateBundleItem(index, 'product_id', value)}
                      valueKey="id"
                      labelKey="name"
                      placeholder="Pilih produk"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateBundleItem(index, 'quantity', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeBundleItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Fields */}
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
          <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Batal
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Memperbarui...' : 'Perbarui'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
