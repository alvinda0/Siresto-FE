// types/bank-platform.ts

export interface BankPlatform {
    bank_platform_id: string;
    account_number: string;
    bank_name: string;
    account_name: string;
    bank_code: string;
    status: "Pending" | "Accepted" | "Rejected" | "Revised";
    platform_id: string;
    platform_name: string;
    created_by: string;
    created_by_name: string;
    accepted_by?: string | null;
    accepted_by_name?: string | null;
    reason?: string | null;
    created_at: string;
    updated_at: string;
}

export interface BankPlatformResponse {
    success: boolean;
    message: string;
    data: BankPlatform[];
    metadata?: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface BankPlatformDetailResponse {
    success: boolean;
    message: string;
    data: BankPlatform;
}

export interface BankPlatformQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}

export interface BulkActionRequest {
    id: string[];
    reason: string;
}

export interface BulkActionResult {
    id: string;
    status: "success" | "failed";
    message?: string;
}

export interface BulkActionResponse {
    status: number;
    success: boolean;
    message: string;
    data: {
        success_count: number;
        results: BulkActionResult[];
    };
}