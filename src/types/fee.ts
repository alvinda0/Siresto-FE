// types/fee.ts
export interface Fee {
    agent_id: string;
    name: string;
    platform_id: string;
    platform_name: string;
    status: string;
    agent_fee: number;
    platform_fee: number;
    partner_fee?: number;
    total_fee: number;
}

export interface FeeQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    platform_id?: string;
    status?: string;
}

export interface FeeResponse {
    success: boolean;
    message: string;
    data: Fee[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface SingleFeeResponse {
    success: boolean;
    message: string;
    data: Fee;
}

export interface UpdateFeePayload {
    agent_fee?: number;
    platform_fee?: number;
    partner_fee?: number;
}

export interface UpdateFeeResponse {
    success: boolean;
    message: string;
    data: Fee;
}