// services/disbursement-merchant.service.ts
import { apiClient } from "@/lib/axios";
import {
  DisbursementMerchant,
  DisbursementMerchantResponse,
  DisbursementMerchantDetailResponse,
  DisbursementMerchantQueryParams,
  BulkApproveResponse,
  BulkRejectRequest,
  BulkRejectResponse,
  BulkProcessingRequest,
  BulkProcessingResponse,
} from "@/types/disbursement-merchant";

class DisbursementMerchantService {
  async getDisbursementMerchants(
    params?: DisbursementMerchantQueryParams
  ): Promise<DisbursementMerchantResponse> {
    const { data } = await apiClient.get<DisbursementMerchantResponse>(
      "/api/v1/internal/disbursement/merchant",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch disbursement merchants");
  }

  async getDisbursementMerchantById(
    disbursementId: string
  ): Promise<DisbursementMerchant> {
    const { data } = await apiClient.get<DisbursementMerchantDetailResponse>(
      `/api/v1/internal/disbursement/merchant/${disbursementId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(
      data.message || "Failed to fetch disbursement merchant details"
    );
  }

  async approveDisbursement(
    disbursementId: string,
    formData: FormData
  ): Promise<DisbursementMerchant> {
    const { data } = await apiClient.post<DisbursementMerchantDetailResponse>(
      `/api/v1/internal/disbursement/merchant/${disbursementId}/approve`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to approve disbursement");
  }

  async rejectDisbursement(
    disbursementId: string,
    reason: string
  ): Promise<DisbursementMerchant> {
    const { data } = await apiClient.post<DisbursementMerchantDetailResponse>(
      `/api/v1/internal/disbursement/merchant/${disbursementId}/reject`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to reject disbursement");
  }

  async processingDisbursement(
    disbursementId: string
  ): Promise<DisbursementMerchant> {
    const { data } = await apiClient.post<DisbursementMerchantDetailResponse>(
      `/api/v1/internal/disbursement/merchant/${disbursementId}/process`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(
      data.message || "Failed to move disbursement to processing"
    );
  }

  // services/disbursement-merchant.service.ts - Tambahkan method baru di class

  async bulkApproveDisbursements(
    formData: FormData
  ): Promise<BulkApproveResponse> {
    const { data } = await apiClient.post<BulkApproveResponse>(
      "/api/v1/internal/disbursement/merchant/approve-bulk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk approve disbursements");
  }

  async bulkApproveDisbursementsWithIds(
    request: {
      disbursement_ids: string[];
      reason: string;
      pin: string;
    }
  ): Promise<BulkApproveResponse> {
    const { data } = await apiClient.post<BulkApproveResponse>(
      "/api/v1/internal/disbursement/merchant/approve-bulk",
      request
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk approve disbursements");
  }

  async bulkRejectDisbursements(
    request: BulkRejectRequest
  ): Promise<BulkRejectResponse> {
    const { data } = await apiClient.post<BulkRejectResponse>(
      "/api/v1/internal/disbursement/merchant/reject-bulk",
      request
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk reject disbursements");
  }

  async bulkProcessingDisbursements(
    request: BulkProcessingRequest
  ): Promise<BulkProcessingResponse> {
    const { data } = await apiClient.post<BulkProcessingResponse>(
      "/api/v1/internal/disbursement/merchant/processing-bulk",
      request
    );

    if (data.success) {
      return data;
    }

    throw new Error(
      data.message || "Failed to move disbursements to processing"
    );
  }

  async exportDisbursements(params: {
    status?: string;
    start_date?: string;
    end_date?: string;
    type?: string;
  }): Promise<Blob> {
    const { data } = await apiClient.get(
      "/api/v1/internal/disbursement/merchant/export",
      {
        params,
        responseType: "blob",
      }
    );

    return data;
  }
}

export const disbursementMerchantService = new DisbursementMerchantService();
