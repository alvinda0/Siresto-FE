'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAuthMe } from '@/hooks/useAuthMe';
import { promoService } from '@/services/promo.service';
import type { Promo } from '@/services/promo.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Tag, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import LoadingState from '@/components/LoadingState';
import { ErrorState } from '@/components/ErrorState';
import { CreatePromoModal } from '../../../components/promo/CreatePromoModal';
import { EditPromoModal } from '../../../components/promo/EditPromoModal';
import { DeletePromoModal } from '../../../components/promo/DeletePromoModal';

export default function PromosPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promo | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<Promo | null>(null);

  // Get promos using React Query
  const {
    data: promoResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['promos', page, limit],
    queryFn: () => promoService.getPromos({ page, limit }),
    enabled: !!user && (user.role.name === 'OWNER' || user.role.name === 'ADMIN'),
  });

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role.type !== 'EXTERNAL') {
      router.push('/dashboard');
      return;
    }

    if (user.role.name !== 'OWNER' && user.role.name !== 'ADMIN') {
      router.push('/home');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user) {
    return <LoadingState />;
  }

  if (user.role.name !== 'OWNER' && user.role.name !== 'ADMIN') {
    return (
      <ErrorState
        code={403}
        title="Akses Ditolak"
        description="Anda tidak memiliki izin untuk mengakses halaman ini"
      />
    );
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState
        code={500}
        title="Gagal memuat data promo"
        description={error?.message || 'Terjadi kesalahan'}
      />
    );
  }

  const promos = promoResponse?.data || [];
  const totalPages = promoResponse?.meta?.total_pages || 1;
  const total = promoResponse?.meta?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promo</h1>
          <p className="text-gray-600 mt-1">Kelola promo dan diskon</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Promo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Daftar Promo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {promos.length === 0 ? (
            <div className="py-12 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada promo</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px] pl-6">Nama Promo</TableHead>
                      <TableHead className="min-w-[150px]">Perusahaan/Cabang</TableHead>
                      <TableHead className="w-[120px]">Diskon</TableHead>
                      <TableHead className="w-[120px]">Min. Transaksi</TableHead>
                      <TableHead className="w-[100px]">Kuota</TableHead>
                      <TableHead className="min-w-[150px]">Periode</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[150px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {promos.map((promo) => (
                      <TableRow key={promo.id}>
                        <TableCell className="pl-6">
                          <div className="font-medium">{promo.name}</div>
                          <div className="text-sm text-gray-500">{promo.code}</div>
                        </TableCell>
                        <TableCell>
                          <div>{promo.company_name}</div>
                          {promo.branch_name ? (
                            <div className="text-sm text-gray-500">{promo.branch_name}</div>
                          ) : (
                            <span className="text-sm text-gray-400">Company Level</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {promo.type === 'percentage' ? (
                              <span>{promo.value}%</span>
                            ) : (
                              <span>Rp {promo.value.toLocaleString()}</span>
                            )}
                          </div>
                          {promo.max_discount && (
                            <div className="text-sm text-gray-500">
                              Max: Rp {promo.max_discount.toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>Rp {promo.min_transaction.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="font-medium">{promo.remaining_quota} / {promo.quota}</div>
                          <div className="text-sm text-gray-500">Terpakai: {promo.used_count}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{promo.start_date}</div>
                            <div className="text-gray-500">{promo.end_date}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {promo.is_active && <Badge variant="default">Aktif</Badge>}
                            {promo.is_expired && <Badge variant="destructive">Kadaluarsa</Badge>}
                            {!promo.is_available && <Badge variant="secondary">Tidak Tersedia</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingPromo(promo)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingPromo(promo)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Baris per halaman:</span>
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-sm text-gray-600">
                    {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} dari {total}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <CreatePromoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}

      {editingPromo && (
        <EditPromoModal
          isOpen={!!editingPromo}
          promo={editingPromo}
          onClose={() => setEditingPromo(null)}
          onSuccess={() => {
            setEditingPromo(null);
            refetch();
          }}
        />
      )}

      {deletingPromo && (
        <DeletePromoModal
          isOpen={!!deletingPromo}
          promo={deletingPromo}
          onClose={() => setDeletingPromo(null)}
          onSuccess={() => {
            setDeletingPromo(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
