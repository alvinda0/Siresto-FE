"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transfer } from "@/types/transfer";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Building2, User, Calendar, Clock } from "lucide-react";

interface TransferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: Transfer | null;
}

export const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  isOpen,
  onClose,
  transfer,
}) => {
  if (!transfer) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const createdDateTime = formatDateTime(transfer.created_at);
  const updatedDateTime = formatDateTime(transfer.updated_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Transfer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer ID */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-1">
              Transfer ID
            </div>
            <div className="text-lg font-mono font-semibold text-blue-900 break-all">
              {transfer.id}
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
            <div className="text-center">
              <div className="text-sm text-indigo-600 font-medium mb-2">
                Transfer Amount
              </div>
              <div className="text-4xl font-bold text-indigo-900">
                {formatCurrency(transfer.amount)}
              </div>
            </div>
          </div>

          {/* From & To Merchants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Merchant */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-orange-600" />
                <div className="text-sm font-semibold text-orange-900">
                  From Merchant
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-orange-600 mb-1">Name</div>
                  <div className="font-semibold text-orange-900">
                    {transfer.from_merchant_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-orange-600 mb-1">
                    Balance Before
                  </div>
                  <div className="font-medium text-gray-700">
                    {formatCurrency(transfer.from_before)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-orange-600 mb-1">
                    Balance After
                  </div>
                  <div className="font-bold text-orange-700">
                    {formatCurrency(transfer.from_after)}
                  </div>
                </div>
              </div>
            </div>

            {/* To Merchant */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-green-600" />
                <div className="text-sm font-semibold text-green-900">
                  To Merchant
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-green-600 mb-1">Name</div>
                  <div className="font-semibold text-green-900">
                    {transfer.to_merchant_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600 mb-1">
                    Balance Before
                  </div>
                  <div className="font-medium text-gray-700">
                    {formatCurrency(transfer.to_before)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-green-600 mb-1">
                    Balance After
                  </div>
                  <div className="font-bold text-green-700">
                    {formatCurrency(transfer.to_after)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Agent & Transfer By */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">Agent</div>
              </div>
              <div className="font-semibold text-gray-900">
                {transfer.agent_name}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">
                  Transfer By
                </div>
              </div>
              <div className="font-semibold text-gray-900">
                {transfer.transfer_by_name}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">
                  Created At
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  {createdDateTime.date}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {createdDateTime.time}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div className="text-sm font-medium text-gray-600">
                  Updated At
                </div>
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-gray-900">
                  {updatedDateTime.date}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {updatedDateTime.time}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
