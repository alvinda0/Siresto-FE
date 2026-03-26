// types/wallet-merchant.ts

export interface WalletMerchant {
    wallet_id: string;
    merchant_id: string;
    merchant_name: string;
    agent_id: string;
    agent_name: string;
    vendor_id: string;
    vendor_name: string;
    pending_balance: number;
    available_balance: number;
    total_balance: number;
    created_at: string;
    updated_at: string;
    estimated_balance?: number;
}

export interface WalletMerchantQueryParams {
    page?: number;
    limit?: number;
    merchant_id?: string;
    agent_id?: string;
    search?: string;
    platform_id?: string;
    vendor_id?: string;
    status?: string;
}

export interface WalletMerchantResponse {
    success: boolean;
    message?: string;
    data: WalletMerchant | WalletMerchant[];
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

export interface WalletMerchantSummary {
    total_pending_balance: number;
    total_available_balance: number;
    total_balance: number;
}