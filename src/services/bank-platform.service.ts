// services/bankPlatform.service.ts

import { apiClient } from "@/lib/axios";
import {
  BankPlatform,
  BankPlatformResponse,
  BankPlatformDetailResponse,
  BankPlatformQueryParams,
  BulkActionResponse,
} from "@/types/bank-platform";

class BankPlatformService {
  /**
   * Get all bank platforms with optional filters
   * Returns full response including metadata for pagination
   */
  async getBankPlatforms(
    params?: BankPlatformQueryParams
  ): Promise<BankPlatformResponse> {
    const { data } = await apiClient.get<BankPlatformResponse>(
      "/api/v1/internal/bank/platforms",
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch bank platforms");
  }

  /**
   * Get bank platform by ID
   */
  async getBankPlatformById(bankPlatformId: string): Promise<BankPlatform> {
    const { data } = await apiClient.get<BankPlatformDetailResponse>(
      `/api/v1/internal/bank/platforms/${bankPlatformId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch bank platform details");
  }

  /**
   * Accept bank platform
   */
  async acceptBankPlatform(
    bankPlatformId: string,
    reason: string
  ): Promise<BankPlatform> {
    const { data } = await apiClient.post<BankPlatformDetailResponse>(
      `/api/v1/internal/bank/platforms/${bankPlatformId}/accept`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to accept bank platform");
  }

  /**
   * Reject bank platform
   */
  async rejectBankPlatform(
    bankPlatformId: string,
    reason: string
  ): Promise<BankPlatform> {
    const { data } = await apiClient.post<BankPlatformDetailResponse>(
      `/api/v1/internal/bank/platforms/${bankPlatformId}/reject`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to reject bank platform");
  }

  async bulkAcceptBankPlatforms(
    ids: string[],
    reason: string
  ): Promise<BulkActionResponse> {
    const { data } = await apiClient.post<BulkActionResponse>(
      "/api/v1/internal/bank/platforms/bulk/accept",
      { id: ids, reason }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk accept bank platforms");
  }

  async bulkRejectBankPlatforms(
    ids: string[],
    reason: string
  ): Promise<BulkActionResponse> {
    const { data } = await apiClient.post<BulkActionResponse>(
      "/api/v1/internal/bank/platforms/bulk/reject",
      { id: ids, reason }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk reject bank platforms");
  }
}

export const bankPlatformService = new BankPlatformService();
