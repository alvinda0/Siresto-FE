// services/wallet-merchant.service.ts

import { apiClient } from "@/lib/axios";
import {
  WalletMerchant,
  WalletMerchantResponse,
  WalletMerchantQueryParams,
  WalletMerchantSummary,
} from "@/types/wallet-merchant";
import { estimatedMerchantService } from "./estimated-merchant.service";

class WalletMerchantService {
  async getWalletMerchants(
    params?: WalletMerchantQueryParams
  ): Promise<WalletMerchantResponse> {
    const { data } = await apiClient.get<WalletMerchantResponse>(
      "/api/v1/internal/wallet/merchants",
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch wallet merchants");
  }

  async getWalletMerchantById(walletId: string): Promise<WalletMerchant> {
    const { data } = await apiClient.get<WalletMerchantResponse>(
      `/api/v1/internal/wallet/merchants/${walletId}`
    );

    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }

    throw new Error(data.message || "Failed to fetch wallet merchant");
  }

  // Helper method to merge wallet merchants with estimated balances
  async getWalletMerchantsWithEstimated(
    params?: WalletMerchantQueryParams
  ): Promise<WalletMerchantResponse> {
    // Fetch both wallet merchants and estimated merchants
    const [walletResponse, estimatedMerchants] = await Promise.all([
      this.getWalletMerchants(params),
      estimatedMerchantService.getEstimatedMerchants(),
    ]);

    // Create a map of merchant_id to estimated balance
    const estimatedMap = new Map<string, number>();
    estimatedMerchants.forEach((est) => {
      estimatedMap.set(est.merchant_id, est.balance);
    });

    // Extract wallets array
    const walletsData = Array.isArray(walletResponse.data)
      ? walletResponse.data
      : [walletResponse.data];

    // Merge the data
    const wallets = walletsData.map((wallet) => ({
      ...wallet,
      estimated_balance: estimatedMap.get(wallet.merchant_id) || 0,
    }));

    // Return response with merged data
    return {
      ...walletResponse,
      data: wallets,
    };
  }
}

export const walletMerchantService = new WalletMerchantService();
