// services/settlement-platform.service.ts

import { apiClient } from "@/lib/axios";
import {
  SettlementPlatform,
  SettlementPlatformResponse,
  SettlementPlatformDetailResponse,
  SettlementPlatformQueryParams,
  CreateSettlementPlatformPayload,
  CreateSettlementPlatformResponse,
  BulkSettlementPlatformResponse,
} from "@/types/settlement-platform";

class SettlementPlatformService {
  /**
   * Get all settlement platforms with optional filters
   * Returns full response including metadata for pagination
   */
  async getSettlements(
    params?: SettlementPlatformQueryParams
  ): Promise<SettlementPlatformResponse> {
    const { data } = await apiClient.get<SettlementPlatformResponse>(
      "/api/v1/settlement/platform",
      { params }
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch platform settlements");
    }

    return data;
  }

  /**
   * Get settlement platform by ID
   */
  async getSettlementById(settlementId: string): Promise<SettlementPlatform> {
    const { data } = await apiClient.get<SettlementPlatformDetailResponse>(
      `/api/v1/settlement/platform/${settlementId}`
    );

    if (!data.success || !data.data) {
      throw new Error(
        data.message || "Failed to fetch platform settlement detail"
      );
    }

    return data.data;
  }

  /**
   * Create new settlement platform
   */
  async createSettlement(
    payload: CreateSettlementPlatformPayload
  ): Promise<SettlementPlatform> {
    const { data } = await apiClient.post<CreateSettlementPlatformResponse>(
      "/api/v1/settlement/platform",
      payload
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create platform settlement");
    }

    return data.data;
  }

  /**
   * Create bulk settlement platforms
   */
  async bulkSettlement(
    file: File,
    pin: string
  ): Promise<BulkSettlementPlatformResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("pin", pin);

    const { data } = await apiClient.post<BulkSettlementPlatformResponse>(
      "/api/v1/settlement/platform/bulk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to process bulk settlement");
    }

    return data;
  }

  /**
   * Download settlement platform template
   */
  async downloadTemplate(): Promise<void> {
    const response = await apiClient.get(
      "/api/v1/settlement/platform/template",
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const contentDisposition = response.headers["content-disposition"];
    let filename = "settlement_platform_template.xlsx";

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
  }

  /**
   * Download platform estimated settlement
   */
  async downloadPlatformEstimated(): Promise<void> {
    const response = await apiClient.get(
      "/api/v1/internal/estimated/platform/download",
      { responseType: "blob" }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;

    const date = new Date().toISOString().split("T")[0];
    const filename = `platform_estimated_settlement_${date}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
  /**
   * Download monthly platform fee analytics
   */
  async downloadMonthlyPlatformFee(
    platformId: string,
    month: string
  ): Promise<void> {
    const response = await apiClient.post(
      "/api/v1/internal/analytics/monthly-platform-fee",
      {
        platform_id: platformId,
        month: month,
      },
      {
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `platform_fee_${month}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const settlementPlatformService = new SettlementPlatformService();
