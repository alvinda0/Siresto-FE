'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promoService } from '@/services/promo.service';
import type { Promo } from '@/services/promo.service';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeletePromoModalProps {
  isOpen: boolean;
  promo: Promo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePromoModal({ isOpen, promo, onClose, onSuccess }: DeletePromoModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promoService.deletePromo(id),
    onSuccess: () => {
      toast.success('Promo berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['promos'] });
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus promo');
    },
  });

  if (!promo) return null;

  const handleDelete = () => {
    deleteMutation.mutate(promo.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Promo">
      <div className="space-y-4">
        {deleteMutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {(deleteMutation.error as any)?.response?.data?.message || 'Gagal menghapus promo'}
          </div>
        )}

        <p>
          Apakah Anda yakin ingin menghapus promo <strong>{promo.name}</strong> ({promo.code})?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={deleteMutation.isPending}>
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
