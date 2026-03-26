// services/merchantRequest.service.ts
import { apiClient } from "@/lib/axios";
import {
  MerchantRequest,
  MerchantRequestResponse,
  MerchantRequestDetailResponse,
  MerchantRequestQueryParams,
} from "@/types/merchantRequest";

class MerchantRequestService {
  /**
   * Get all merchant requests with optional filters and pagination
   */
  async getMerchantRequests(params?: MerchantRequestQueryParams): Promise<MerchantRequestResponse> {
    const { data } = await apiClient.get<MerchantRequestResponse>(
      "/api/v1/internal/merchant/requests",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch merchant requests");
  }

  /**
   * Get merchant request by ID
   */
  async getMerchantRequestById(requestId: string): Promise<MerchantRequest> {
    const { data } = await apiClient.get<MerchantRequestDetailResponse>(
      `/api/v1/internal/merchant/requests/${requestId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch merchant request details");
  }

  /**
   * Approve merchant request
   */
  async approveMerchantRequest(requestId: string): Promise<MerchantRequest> {
    try {
      const { data } = await apiClient.post(
        `/api/v1/internal/merchant/requests/${requestId}/approve`
      );

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.message || "Failed to approve merchant request");
    } catch (error: any) {
      console.error("Approve merchant request error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to approve merchant request"
      );
    }
  }

  /**
   * Reject merchant request
   */
  async rejectMerchantRequest(requestId: string, reason: string): Promise<MerchantRequest> {
    try {
      const { data } = await apiClient.post(
        `/api/v1/internal/merchant/requests/${requestId}/reject`,
        { reason }
      );

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.message || "Failed to reject merchant request");
    } catch (error: any) {
      console.error("Reject merchant request error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to reject merchant request"
      );
    }
  }
}

export const merchantRequestService = new MerchantRequestService();