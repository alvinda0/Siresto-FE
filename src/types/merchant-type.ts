// types/merchant-type.ts
export interface MerchantType {
    merchant_type_id: string;
    name: string;
    slug: string;
    minimum: number;
    maximum: number;
    created_at: string;
    updated_at: string;
}

export interface MerchantTypeQueryParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface MerchantTypeResponse {
    success: boolean;
    message: string;
    data: MerchantType[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface MerchantTypeDetailResponse {
    success: boolean;
    message: string;
    data: MerchantType;
}

export interface CreateMerchantTypePayload {
    name: string;
    slug: string;
    minimum: number;
    maximum: number;
}

export interface UpdateMerchantTypePayload {
    name: string;
    slug: string;
    minimum: number;
    maximum: number;
}