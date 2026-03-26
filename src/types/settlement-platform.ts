// types/settlement-platform.ts

export interface SettlementPlatform {
    settlement_id: string;
    platform_id: string;
    platform_name: string;
    amount: number;
    reference: string;
    settle_by: string;
    settle_by_name: string;
    created_at: string;
    updated_at: string;
}

export interface SettlementPlatformQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    platform_id?: string;
    settle_by?: string;
}

export interface SettlementPlatformResponse {
    success: boolean;
    message: string;
    data: SettlementPlatform[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface SettlementPlatformDetailResponse {
    success: boolean;
    message: string;
    data: SettlementPlatform;
}

export interface CreateSettlementPlatformPayload {
    platform_id: string;
    amount: number;
    reference?: string;
    pin: string;
}

export interface CreateSettlementPlatformResponse {
    success: boolean;
    message: string;
    data: SettlementPlatform;
}

export interface BulkSettlementPlatformResponse {
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