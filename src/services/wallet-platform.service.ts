// services/wallet-platform.service.ts

import { apiClient } from '@/lib/axios';
import { 
  WalletPlatform, 
  WalletPlatformQueryParams, 
  WalletPlatformResponse 
} from '@/types/wallet-platform';

class WalletPlatformService {
  /**
   * Get all wallet platforms with optional filters
   * Returns full response including metadata for pagination
   */
  async getWalletPlatforms(params?: WalletPlatformQueryParams): Promise<WalletPlatformResponse> {

    const { data } = await apiClient.get<WalletPlatformResponse>(
      '/api/v1/internal/wallet/platforms',
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata and summary
    }

    throw new Error(data.message || 'Failed to fetch wallet platforms');
  }

  /**
   * Get wallet platform by ID
   */
  async getWalletPlatformById(walletId: string): Promise<WalletPlatform> {

    const { data } = await apiClient.get<WalletPlatformResponse>(
      `/api/v1/internal/wallet/platforms/${walletId}`
    );

    if (data.success && data.data) {
      return Array.isArray(data.data) ? data.data[0] : data.data;
    }

    throw new Error(data.message || 'Failed to fetch wallet platform');
  }
}

export const walletPlatformService = new WalletPlatformService();