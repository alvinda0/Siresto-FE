'use client';

import { useQuery } from '@tanstack/react-query';
import { promoService } from '@/services/promo.service';
import { productService } from '@/services/product.service';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Calendar, Users, Package, ShoppingBag } from 'lucide-react';

interface PromoDetailModalProps {
  isOpen: boolean;
  promoId: string | null;
  onClose: () => void;
}

export function PromoDetailModal({ isOpen, promoId, onClose }: PromoDetailModalProps) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['promo', promoId],
    queryFn: () => promoService.getPromoById(promoId!),
    enabled: isOpen && !!promoId,
  });

  const promo = response?.data;

  // Get product details if promo has product_ids or bundle_items
  const productIds = promo?.product_ids || promo?.bundle_items?.map(item => item.product_id) || [];
  const { data: productsResponse } = useQuery({
    queryKey: ['products-for-promo', productIds],
    queryFn: () => productService.getProducts({ limit: 1000 }),
    enabled: isOpen && productIds.length > 0,
  });

  const products = productsResponse?.data || [];
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Promo" size="lg">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : promo ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{promo.name}</h3>
                <p className="text-gray-600 mt-1">Kode: {promo.code}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant={
                  promo.promo_category === 'normal' ? 'default' :
                  promo.promo_category === 'product' ? 'secondary' : 'outline'
                }>
                  {promo.promo_category === 'normal' ? 'Normal' :
                   promo.promo_category === 'product' ? 'Produk' : 'Bundle'}
                </Badge>
                {promo.is_active && <Badge variant="default">Aktif</Badge>}
                {promo.is_expired && <Badge variant="destructive">Kadaluarsa</Badge>}
                {!promo.is_available && <Badge variant="secondary">Tidak Tersedia</Badge>}
              </div>
            </div>
          </div>

          {/* Company & Branch Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Perusahaan</p>
              <p className="font-medium">{promo.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cabang</p>
              <p className="font-medium">
                {promo.branch_name || <span className="text-gray-400">Company Level</span>}
              </p>
            </div>
          </div>

          {/* Discount Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Informasi Diskon</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-blue-700">Tipe</p>
                <p className="font-medium text-blue-900">
                  {promo.type === 'percentage' ? 'Persentase' : 'Nominal Tetap'}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Nilai Diskon</p>
                <p className="font-medium text-blue-900">
                  {promo.type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString()}`}
                </p>
              </div>
              {promo.max_discount && (
                <div>
                  <p className="text-sm text-blue-700">Diskon Maksimal</p>
                  <p className="font-medium text-blue-900">Rp {promo.max_discount.toLocaleString()}</p>
                </div>
              )}
              {promo.min_transaction && (
                <div>
                  <p className="text-sm text-blue-700">Transaksi Minimal</p>
                  <p className="font-medium text-blue-900">Rp {promo.min_transaction.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Product List for Product Promo */}
          {promo.promo_category === 'product' && promo.product_ids && promo.product_ids.length > 0 && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-purple-900">Produk yang Berlaku</h4>
              </div>
              <div className="space-y-2">
                {promo.product_ids.map((productId, index) => (
                  <div key={productId} className="flex items-center gap-2 text-purple-900">
                    <span className="text-sm font-medium">{index + 1}.</span>
                    <span className="text-sm">{getProductName(productId)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bundle Items for Bundle Promo */}
          {promo.promo_category === 'bundle' && promo.bundle_items && promo.bundle_items.length > 0 && (
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-5 w-5 text-orange-600" />
                <h4 className="font-semibold text-orange-900">Item Bundle</h4>
              </div>
              <div className="space-y-2">
                {promo.bundle_items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-orange-900">
                    <span className="text-sm">{getProductName(item.product_id)}</span>
                    <span className="text-sm font-medium">{item.quantity}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Info - Only for Normal Promo */}
          {promo.promo_category === 'normal' && promo.quota && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Penggunaan</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-green-700">Total Kuota</p>
                  <p className="font-medium text-green-900">{promo.quota}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Terpakai</p>
                  <p className="font-medium text-green-900">{promo.used_count ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Sisa</p>
                  <p className="font-medium text-green-900">{promo.remaining_quota ?? 0}</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${((promo.used_count ?? 0) / promo.quota) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-green-700 mt-1 text-center">
                  {(((promo.used_count ?? 0) / promo.quota) * 100).toFixed(1)}% terpakai
                </p>
              </div>
            </div>
          )}

          {/* Period Info */}
          <div className="bg-indigo-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-900">Periode Promo</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-indigo-700">Tanggal Mulai</p>
                <p className="font-medium text-indigo-900">{promo.start_date}</p>
              </div>
              <div>
                <p className="text-sm text-indigo-700">Tanggal Berakhir</p>
                <p className="font-medium text-indigo-900">{promo.end_date}</p>
              </div>
            </div>
          </div>

          {/* Category & Timestamps */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Kategori</p>
              <p className="font-medium capitalize">{promo.promo_category}</p>
            </div>
            <div>
              <p className="text-gray-600">Dibuat</p>
              <p className="font-medium">{promo.created_at}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Terakhir Diperbarui</p>
              <p className="font-medium">{promo.updated_at}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-600">
          Promo tidak ditemukan
        </div>
      )}
    </Modal>
  );
}
