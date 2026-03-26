// services/disbursement-platform.service.ts
import { apiClient } from "@/lib/axios";
import {
  DisbursementPlatform,
  DisbursementPlatformResponse,
  DisbursementPlatformDetailResponse,
  DisbursementPlatformQueryParams,
  BulkApproveResponse,
  BulkRejectRequest,
  BulkRejectResponse,
  BulkProcessingRequest,
  BulkProcessingResponse,
} from "@/types/disbursement-platform";

class DisbursementPlatformService {
  async getDisbursementPlatforms(
    params?: DisbursementPlatformQueryParams
  ): Promise<DisbursementPlatformResponse> {
    const { data } = await apiClient.get<DisbursementPlatformResponse>(
      "/api/v1/internal/disbursement/platform",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch disbursement platforms");
  }

  async getDisbursementPlatformById(
    disbursementId: string
  ): Promise<DisbursementPlatform> {
    const { data } = await apiClient.get<DisbursementPlatformDetailResponse>(
      `/api/v1/internal/disbursement/platform/${disbursementId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(
      data.message || "Failed to fetch disbursement platform details"
    );
  }

  async uploadProof(
    disbursementId: string,
    formData: FormData
  ): Promise<DisbursementPlatform> {
    const { data } = await apiClient.post<DisbursementPlatformDetailResponse>(
      `/api/v1/internal/disbursement/platform/${disbursementId}/proof`,
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

    throw new Error(data.message || "Failed to upload proof");
  }

  async approveDisbursement(
    disbursementId: string,
    formData: FormData
  ): Promise<DisbursementPlatform> {
    const { data } = await apiClient.post<DisbursementPlatformDetailResponse>(
      `/api/v1/internal/disbursement/platform/${disbursementId}/approve`,
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
  ): Promise<DisbursementPlatform> {
    const { data } = await apiClient.post<DisbursementPlatformDetailResponse>(
      `/api/v1/internal/disbursement/platform/${disbursementId}/reject`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to reject disbursement");
  }

  async processingDisbursement(
    disbursementId: string
  ): Promise<DisbursementPlatform> {
    const { data } = await apiClient.post<DisbursementPlatformDetailResponse>(
      `/api/v1/internal/disbursement/platform/${disbursementId}/process`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(
      data.message || "Failed to move disbursement to processing"
    );
  }

  async bulkApproveDisbursements(
    formData: FormData
  ): Promise<BulkApproveResponse> {
    const { data } = await apiClient.post<BulkApproveResponse>(
      "/api/v1/internal/disbursement/platform/approve-bulk",
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
      "/api/v1/internal/disbursement/platform/approve-bulk",
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
      "/api/v1/internal/disbursement/platform/reject-bulk",
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
      "/api/v1/internal/disbursement/platform/processing-bulk",
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
      "/api/v1/internal/disbursement/platform/export",
      {
        params,
        responseType: "blob",
      }
    );

    return data;
  }

  async createReduction(request: {
    platform_id: string;
    amount: number;
    admin_cost: number;
    reason: string;
    twofa_token: string;
  }): Promise<DisbursementPlatform> {
    const { data } = await apiClient.post<DisbursementPlatformDetailResponse>(
      "/api/v1/internal/disbursement/platform/reduction",
      request
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to create reduction");
  }
}

export const disbursementPlatformService = new DisbursementPlatformService();