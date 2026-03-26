// types/wallet-platform.ts

export interface WalletPlatform {
  wallet_id: string;
  platform_id: string;
  platform_name: string;
  pending_balance: number;
  available_balance: number;
  total_balance: number;
  created_at: string;
  updated_at: string;
}

export interface WalletPlatformQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  platform_id?: string;
}

export interface WalletPlatformResponse {
  success: boolean;
  message?: string;
  data: WalletPlatform | WalletPlatform[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  total_pending_balance: number;
  total_available_balance: number;
  total_balance: number;
}

export interface WalletPlatformSummary {
  total_pending_balance: number;
  total_available_balance: number;
  total_balance: number;
}