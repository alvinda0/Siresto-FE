// types/platform.ts

export interface Platform {
    platform_id: string;
    partner_id: string;
    partner_name: string;
    fee: number;
    name: string;
    referral: string;
    status: "ACTIVE" | "PENDING" | "INACTIVE";
    created_at: string;
    updated_at: string;
}

export interface PlatformQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    partner_id?: string;
    partner_name?: string;
    platform_id?: string;
    status?: string;
}

export interface PlatformResponse {
    success: boolean;
    message: string;
    data: Platform[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface SinglePlatformResponse {
    success: boolean;
    message: string;
    data: Platform;
}

export interface CreatePlatformPayload {
    partner_id: string;
    name: string;
    referral: string;
    fee: number;
    status: string;
}

export interface CreatePlatformResponse {
    success: boolean;
    message: string;
    data: Platform;
}

export interface UpdatePlatformPayload {
    partner_id?: string;
    name?: string;
    referral?: string;
    fee?: number;
    status?: string;
}

export interface UpdatePlatformResponse {
    success: boolean;
    message: string;
    data: Platform;
}