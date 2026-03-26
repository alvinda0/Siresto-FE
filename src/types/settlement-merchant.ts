// types/settlement-merchant.ts

export interface SettlementMerchant {
    settlement_id: string;
    merchant_id: string;
    merchant_name: string;
    vendor_name: string;
    amount: number;
    reference: string;
    settle_by: string;
    settle_by_name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface SettlementMerchantQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    merchant_id?: string;
    vendor_id?: string;
}

export interface SettlementMerchantResponse {
    success: boolean;
    message: string;
    data: SettlementMerchant[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface SettlementMerchantDetailResponse {
    success: boolean;
    message: string;
    data: SettlementMerchant;
}

export interface CreateSettlementMerchantPayload {
    merchant_id: string;
    amount: number;
    reference?: string;
    pin: string;
}

export interface CreateSettlementMerchantResponse {
    success: boolean;
    message: string;
    data: SettlementMerchant;
}

export interface BulkSettlementMerchantResponse {
    success: boolean;
    message: string;
    data?: {
        success_count: number;
        failed_count: number;
        errors?: Array<{
            row: number;
            error: string;
        }>;
    };
}