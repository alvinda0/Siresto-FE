// components/merchant/MerchantRequestRejectModal.tsx
'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { XCircle } from 'lucide-react';

interface MerchantRequestRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  merchantRequestId?: string;
  agentName?: string;
}

export function MerchantRequestRejectModal({
  isOpen,
  onClose,
  onConfirm,
  agentName,
}: MerchantRequestRejectModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim());
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Merchant Request"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {agentName && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">
              You are about to reject the merchant request from <strong>{agentName}</strong>
            </p>
          </div>
        )}

        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a clear reason for rejecting this request..."
            className="
              w-full px-3 py-2 
              border border-gray-300 dark:border-gray-600 
              rounded-lg 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              placeholder-gray-500 dark:placeholder-gray-400
              focus:ring-2 focus:ring-red-500 focus:border-red-500
              resize-none
            "
            rows={4}
            required
            disabled={isSubmitting}
          />
          {reason.trim().length === 0 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              A rejection reason is required to proceed
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="
              px-4 py-2 
              text-sm font-medium 
              text-gray-700 dark:text-gray-300 
              bg-white dark:bg-gray-800 
              border border-gray-300 dark:border-gray-600 
              rounded-lg 
              hover:bg-gray-50 dark:hover:bg-gray-700 
              focus:ring-2 focus:ring-gray-500 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
            "
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || isSubmitting}
            className="
              px-4 py-2 
              text-sm font-medium 
              text-white 
              bg-red-600 
              border border-transparent 
              rounded-lg 
              hover:bg-red-700 
              focus:ring-2 focus:ring-red-500 
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center gap-2
            "
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Reject Request
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}