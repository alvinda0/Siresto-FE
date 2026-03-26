// services/bank-merchant.service.ts
import { apiClient } from "@/lib/axios";
import {
  BankMerchant,
  BankMerchantResponse,
  BankMerchantDetailResponse,
  BankMerchantQueryParams,
  BulkActionResponse,
} from "@/types/bank-merchant";

class BankMerchantService {
  async getBankMerchants(
    params?: BankMerchantQueryParams
  ): Promise<BankMerchantResponse> {
    const { data } = await apiClient.get<BankMerchantResponse>(
      "/api/v1/internal/bank/merchants",
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch bank merchants");
  }

  async getBankMerchantById(bankMerchantId: string): Promise<BankMerchant> {
    const { data } = await apiClient.get<BankMerchantDetailResponse>(
      `/api/v1/internal/bank/merchants/${bankMerchantId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch bank merchant details");
  }

  async acceptBankMerchant(
    bankMerchantId: string,
    reason: string
  ): Promise<BankMerchant> {
    const { data } = await apiClient.post<BankMerchantDetailResponse>(
      `/api/v1/internal/bank/merchants/${bankMerchantId}/accept`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to accept bank merchant");
  }

  async rejectBankMerchant(
    bankMerchantId: string,
    reason: string
  ): Promise<BankMerchant> {
    const { data } = await apiClient.post<BankMerchantDetailResponse>(
      `/api/v1/internal/bank/merchants/${bankMerchantId}/reject`,
      { reason }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to reject bank merchant");
  }

  async bulkAcceptBankMerchants(
    ids: string[],
    reason: string
  ): Promise<BulkActionResponse> {
    const { data } = await apiClient.post<BulkActionResponse>(
      "/api/v1/internal/bank/merchants/bulk/accept",
      { id: ids, reason }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk accept bank merchants");
  }

  async bulkRejectBankMerchants(
    ids: string[],
    reason: string
  ): Promise<BulkActionResponse> {
    const { data } = await apiClient.post<BulkActionResponse>(
      "/api/v1/internal/bank/merchants/bulk/reject",
      { id: ids, reason }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to bulk reject bank merchants");
  }
}

export const bankMerchantService = new BankMerchantService();
