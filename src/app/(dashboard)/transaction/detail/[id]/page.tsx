"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { transactionService } from "@/services/transaction.service";
import { Transaction } from "@/types/transaction";
import { ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import Image from "next/image";

export const runtime = "edge";

const DetailTransactionPage = () => {
  usePageTitle("Transaction Details");
  const params = useParams();
  const router = useRouter();
  const transactionUuid = params.id as string;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactionDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionById(transactionUuid);
      setTransaction(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch transaction details";
      setError(errorMessage);
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  }, [transactionUuid]);

  useEffect(() => {
    if (transactionUuid) {
      fetchTransactionDetails();
    }
  }, [transactionUuid, fetchTransactionDetails]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const statusColors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      expired: "bg-red-100 text-red-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };
    return statusColors[statusLower] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error || "Transaction not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Transaction Details
          </h1>
          <p className="text-sm text-gray-600">
            View complete information about the transaction
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {transaction.order_id}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {transaction.transaction_uuid}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-medium uppercase ${getStatusColor(
                transaction.status
              )}`}
            >
              {transaction.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Final Amount</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {formatCurrency(transaction.final_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.method}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Currency</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.currency}
                </p>
              </div>
            </div>
          </div>

          {/* QRIS Code */}
          {transaction.qris_image && 
           transaction.method === "QRIS" && 
           transaction.status.toLowerCase() === "pending" && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QRIS Code
              </h3>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                  <Image
                    src={`data:image/png;base64,${transaction.qris_image}`}
                    alt="QRIS Code"
                    className="w-64 h-64 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 text-center max-w-md">
                  Scan this QR code using your mobile banking or e-wallet app to complete the payment
                </p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Source</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.source || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.reference_number || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Vendor Transaction ID</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.vendor_transaction_id || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.username || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Creator Name</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.creator_name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Created At</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {new Date(transaction.created_at).toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Updated At</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {new Date(transaction.updated_at).toLocaleString("id-ID", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expired At</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.expired_at
                    ? new Date(transaction.expired_at).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid At</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.paid_at
                    ? new Date(transaction.paid_at).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {transaction.description && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h3>
              <p className="text-base text-gray-700">
                {transaction.description}
              </p>
            </div>
          )}

          {/* Webhook Queue Information */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Webhook Queue Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payload Status</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.webhook_queue_payload_status || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payload Description</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.webhook_queue_payload_description || "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Queue Status</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  <span
                    className={`px-2 py-1 rounded text-sm font-medium ${
                      transaction.webhook_queue_status === "success"
                        ? "bg-green-100 text-green-700"
                        : transaction.webhook_queue_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {transaction.webhook_queue_status || "-"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Retry Count</p>
                <p className="text-base font-medium text-gray-900 mt-1">
                  {transaction.webhook_queue_retry_count !== undefined
                    ? `${transaction.webhook_queue_retry_count} / ${transaction.webhook_queue_max_retries}`
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRoleProtection(DetailTransactionPage, [
  "Superuser",
  "Supervisor",
  "StaffEntry"
]);