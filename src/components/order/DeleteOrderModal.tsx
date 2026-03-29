'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteOrderModalProps {
  isOpen: boolean;
  orderId: string | null;
  orderNumber?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteOrderModal({ 
  isOpen, 
  orderId, 
  orderNumber,
  onClose, 
  onSuccess 
}: DeleteOrderModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.deleteOrder(id),
    onSuccess: () => {
      toast.success('Order berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Gagal menghapus order');
    },
  });

  if (!orderId) return null;

  const handleDelete = () => {
    deleteMutation.mutate(orderId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hapus Order">
      <div className="space-y-4">
        {deleteMutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded">
            {(deleteMutation.error as any)?.response?.data?.message || 'Gagal menghapus order'}
          </div>
        )}

        <p>
          Apakah Anda yakin ingin menghapus order{' '}
          <strong>{orderNumber || orderId.substring(0, 8)}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex justify-end gap-2 pt-4">
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
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
