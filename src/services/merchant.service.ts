// services/merchant.service.ts
import { apiClient } from "@/lib/axios";
import {
  Merchant,
  MerchantDetailResponse,
  MerchantResponse,
  UpdateMerchantPayload,
  UpdateMerchantResponse,
  CreateMerchantPayload,
  MerchantQueryParams,
  BulkUploadResponse,
  BulkAssignResponse,
  MerchantAnalytics,
  MerchantAnalyticsResponse,
} from "@/types/merchant";

class MerchantService {
  /**
   * Get all merchants with optional filters and pagination
   */
  async getMerchants(params?: MerchantQueryParams): Promise<MerchantResponse> {
    const { data } = await apiClient.get<MerchantResponse>(
      "/api/v1/internal/merchants",
      { params },
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch merchants");
  }

  async getMerchantsForSelect(): Promise<Merchant[]> {
    const { data } = await apiClient.get<MerchantResponse>(
      "/api/v1/internal/merchants",
      { params: { limit: 1000 } },
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch merchants");
  }

  /**
   * Get merchant by ID
   */
  async getMerchantById(merchantId: string): Promise<Merchant> {
    const { data } = await apiClient.get<MerchantDetailResponse>(
      `/api/v1/internal/merchants/${merchantId}`,
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch merchant details");
  }

  /**
   * Create new merchant
   */
  async createMerchant(payload: CreateMerchantPayload): Promise<Merchant> {
    try {
      const requestBody: any = {
        vendor_id: payload.vendor_id,
        agent_id: payload.agent_id,
        name: payload.name,
        merchant_type_id: payload.merchant_type_id,
        status: payload.status,
        environment: payload.environment,
      };

      if (payload.external_id) {
        requestBody.external_id = payload.external_id;
      }
      if (payload.api_key) {
        requestBody.api_key = payload.api_key;
      }

      const { data } = await apiClient.post<MerchantResponse>(
        "/api/v1/internal/merchants",
        requestBody,
      );

      if (data.success) {
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data[0];
        }
        if (data.data && !Array.isArray(data.data)) {
          return data.data as Merchant;
        }
      }

      throw new Error(data.message || "Failed to create merchant");
    } catch (error: any) {
      console.error("Service error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create merchant",
      );
    }
  }

  /**
   * Delete merchant
   */
  async deleteMerchant(merchantId: string): Promise<void> {
    const { data } = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/api/v1/internal/merchants/${merchantId}`);

    if (!data.success) {
      throw new Error(data.message || "Failed to delete merchant");
    }
  }

  /**
   * Update merchant
   */
  async updateMerchant(
    merchantId: string,
    payload: UpdateMerchantPayload,
  ): Promise<Merchant> {
    try {
      const { data } = await apiClient.put<UpdateMerchantResponse>(
        `/api/v1/internal/merchants/${merchantId}`,
        payload,
      );

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error(data.message || "Failed to update merchant");
    } catch (error: any) {
      console.error("Update merchant error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update merchant",
      );
    }
  }

  /**
   * Download merchant template
   */
  async downloadTemplate(): Promise<void> {
    try {
      const response = await apiClient.get(
        "/api/v1/internal/merchants/template",
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "merchant_template.xlsx";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Download template error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to download template",
      );
    }
  }

  /**
   * Bulk upload merchants
   */
  async bulkUploadMerchants(file: File): Promise<BulkUploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await apiClient.post<BulkUploadResponse>(
        "/api/v1/internal/merchants/bulk",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (data.success) {
        return data;
      }

      throw new Error(data.message || "Failed to upload merchants");
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload merchants",
      );
    }
  }

  /**
   * Bulk assign merchants to agent
   */
  async bulkAssignMerchants(
    merchantIds: string[],
    agentId: string,
    merchantRequestId?: string,
  ): Promise<BulkAssignResponse> {
    try {
      const requestBody: any = {
        merchant_ids: merchantIds,
        agent_id: agentId,
      };

      if (merchantRequestId) {
        requestBody.merchant_request_id = merchantRequestId;
      }

      const { data } = await apiClient.post<BulkAssignResponse>(
        "/api/v1/internal/merchants/bulk-assign",
        requestBody,
      );

      if (data.success) {
        return data;
      }

      throw new Error(data.message || "Failed to assign merchants");
    } catch (error: any) {
      console.error("Bulk assign error:", error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to assign merchants",
      );
    }
  }

  async getMerchantAnalytics(vendorId?: string): Promise<MerchantAnalytics> {
    const params: any = {};

    if (vendorId && vendorId !== "all") {
      params.vendor_id = vendorId;
    }

    const { data } = await apiClient.get<MerchantAnalyticsResponse>(
      "/api/v1/internal/merchants/analytics",
      { params },
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch merchant analytics");
  }
}

export const merchantService = new MerchantService();
