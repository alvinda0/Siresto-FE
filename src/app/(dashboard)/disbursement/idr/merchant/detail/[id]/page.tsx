// app/disbursement-merchant-idr/detail/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { disbursementMerchantService } from "@/services/disbursement-merchant.service";
import { DisbursementMerchant } from "@/types/disbursement-merchant";
import { ArrowLeft, Download, ExternalLink, Copy, Check } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { withRoleProtection } from "@/components/ProtectedRoles";
import { formatCurrency, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

export const runtime = 'edge';

const DetailDisbursementMerchantIdrPage = () => {
  usePageTitle("Disbursement Merchant IDR Details");
  const params = useParams();
  const router = useRouter();
  const disbursementId = params.id as string;

  const [disbursement, setDisbursement] =
    useState<DisbursementMerchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchDisbursementDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data =
        await disbursementMerchantService.getDisbursementMerchantById(
          disbursementId
        );
      setDisbursement(data);
      setError(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      setDisbursement(null);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [disbursementId]);

  useEffect(() => {
    if (disbursementId) {
      fetchDisbursementDetails();
    }
  }, [disbursementId, fetchDisbursementDetails]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      PROCESSING: "bg-blue-100 text-blue-700 border-blue-300",
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
    };
    return (
      statusColors[status] || "bg-gray-100 text-gray-700 border-gray-300"
    );
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading disbursement details...</p>
        </div>
      </div>
    );
  }

  if (error || !disbursement) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">
            {error || "Disbursement not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Disbursement Details
          </h1>
          <p className="text-sm text-gray-600">
            View complete information about the disbursement
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {disbursement.merchant_name}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-gray-500">
                  {disbursement.disbursement_id}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(
                      disbursement.disbursement_id,
                      "Disbursement ID"
                    )
                  }
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Copy Disbursement ID"
                >
                  {copiedField === "Disbursement ID" ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getStatusColor(
                disbursement.status
              )}`}
            >
              {disbursement.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Disbursement Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Disbursement Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Disbursement ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-gray-900 break-all">
                    {disbursement.disbursement_id}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Merchant ID</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-gray-900 break-all">
                    {disbursement.merchant_id}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(disbursement.merchant_id, "Merchant ID")
                    }
                    className="p-1 rounded hover:bg-gray-200 transition-colors shrink-0"
                    title="Copy Merchant ID"
                  >
                    {copiedField === "Merchant ID" ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Merchant Name</p>
                <p className="text-base font-semibold text-indigo-700">
                  {disbursement.merchant_name}
                </p>
              </div>
              {disbursement.vendor_name && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                  <p className="text-base font-semibold text-purple-700">
                    {disbursement.vendor_name}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <p className="text-base font-semibold text-blue-700">
                  {disbursement.type}
                </p>
              </div>
              {disbursement.channel && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Channel</p>
                  <p className="text-base font-semibold text-teal-700 uppercase">
                    {disbursement.channel}
                  </p>
                </div>
              )}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Amount</p>
                <p className="text-xl font-bold text-blue-700">
                  {formatCurrency(disbursement.amount)}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-600 mb-1">Admin Cost</p>
                <p className="text-xl font-bold text-orange-700">
                  {formatCurrency(disbursement.admin_cost)}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 md:col-span-2">
                <p className="text-sm text-green-600 mb-1">
                  Total Disbursement
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(disbursement.total_disbursements)}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Information */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Bank Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {disbursement.bank_name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Bank Code</p>
                <p className="text-base font-medium text-gray-900">
                  {disbursement.bank_code}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Account Name</p>
                <p className="text-base font-semibold text-gray-900">
                  {disbursement.account_name}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Account Number</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-medium text-gray-900">
                    {disbursement.account_number}
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        disbursement.account_number,
                        "Account Number"
                      )
                    }
                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Copy Account Number"
                  >
                    {copiedField === "Account Number" ? (
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Wallet Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Before Wallet</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(disbursement.before_wallet || 0)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">After Wallet</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(disbursement.after_wallet || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Processing Information - Only show if processed */}
          {(disbursement.process_by ||
            disbursement.process_by_name ||
            disbursement.processing_status ||
            disbursement.reason) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Processing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disbursement.processing_status && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 mb-1">Processing Status</p>
                    <p className="text-base font-bold text-purple-700 uppercase">
                      {disbursement.processing_status}
                    </p>
                  </div>
                )}
                {disbursement.process_by && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Process By ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-gray-900 break-all">
                        {disbursement.process_by}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            disbursement.process_by!,
                            "Process By ID"
                          )
                        }
                        className="p-1 rounded hover:bg-gray-200 transition-colors shrink-0"
                        title="Copy Process By ID"
                      >
                        {copiedField === "Process By ID" ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {disbursement.process_by_name && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Processed By</p>
                    <p className="text-base font-semibold text-gray-900">
                      {disbursement.process_by_name}
                    </p>
                  </div>
                )}
                {disbursement.reason && (
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Reason</p>
                    <p className="text-base font-medium text-gray-900">
                      {disbursement.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* File Information */}
          {(disbursement.file_id || disbursement.file_url) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Proof of Transfer
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {disbursement.file_id && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">File ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 break-all">
                        {disbursement.file_id}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(disbursement.file_id!, "File ID")
                        }
                        className="p-1 rounded hover:bg-gray-200 transition-colors shrink-0"
                        title="Copy File ID"
                      >
                        {copiedField === "File ID" ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {disbursement.file_url && (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-full max-w-2xl bg-white p-4 rounded-lg border-2 border-gray-200 shadow-sm">
                    <Image
                      src={disbursement.file_url}
                      alt="Proof of Transfer"
                      width={800}
                      height={800}
                      className="w-full h-auto object-contain rounded"
                    />
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={disbursement.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Open in New Tab</span>
                    </a>
                    <a
                      href={disbursement.file_url}
                      download
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Download</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Created At</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(disbursement.created_at)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Updated At</p>
                <p className="text-base font-medium text-gray-900">
                  {formatDateTime(disbursement.updated_at)}
                </p>
              </div>
              {disbursement.deleted_at && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Deleted At</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDateTime(disbursement.deleted_at)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRoleProtection(DetailDisbursementMerchantIdrPage, [
  "Superuser",
  "Supervisor",
  "StaffFinance",
]);