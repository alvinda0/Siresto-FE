// types/estimated-merchant.ts
export interface EstimatedMerchant {
    estimated_id: string;
    merchant_id: string;
    merchant_name: string;
    balance: number;
    last_updated: string;
}

export interface EstimatedMerchantResponse {
    success: boolean;
    message?: string;
    data: EstimatedMerchant | EstimatedMerchant[];
    metadata?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}