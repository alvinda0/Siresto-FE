// types/merchant.ts
export interface Merchant {
    merchant_id: string;
    vendor_id: string;
    vendor_name: string;
    agent_id: string;
    agent_name: string;
    platform_id: string;
    platform_name: string;
    name: string;
    status: string;
    merchant_type_id: string;
    merchant_type_name: string;
    environment: string;
    external_id?: string;
    created_at: string;
    updated_at: string;
}

export interface MerchantQueryParams {
    is_auto?: string;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    environment?: string;
    agent_id?: string;
    vendor_id?: string;
    merchant_type_id?: string;
    platform_id?: string;
    merchant_id?: string;
}

export interface MerchantResponse {
    success: boolean;
    message: string;
    data: Merchant[];
    metadata: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}

export interface MerchantDetailResponse {
    success: boolean;
    message: string;
    data: Merchant;
}

export interface CreateMerchantPayload {
    vendor_id: string;
    agent_id: string;
    name: string;
    merchant_type_id: string;
    status: string;
    environment: string;
    external_id?: string;
    api_key?: string;
}

export interface UpdateMerchantPayload {
    vendor_id?: string;
    agent_id?: string;
    name?: string;
    status?: string;
    merchant_type_id?: string;
    environment?: string;
    external_id?: string;
    api_key?: string;
    reason?: string;
}

export interface UpdateMerchantResponse {
    success: boolean;
    message: string;
    data: Merchant;
}

export interface BulkUploadResponse {
    success: boolean;
    message: string;
    data?: {
        total: number;
        success: number;
        failed: number;
    };
}

export interface BulkAssignResponse {
    success: boolean;
    message: string;
    data?: {
        total: number;
        success: number;
        failed: number;
    };
}
export interface MerchantAnalytics {
  total_agents: number;
  assigned_merchants: number;
  active_assigned: number;
  inactive_assigned: number;
  available_merchants: number;
  merchant_request: number;
}

export interface MerchantAnalyticsResponse {
  success: boolean;
  message: string;
  data: MerchantAnalytics;
}