// types/merchantRequest.ts
export interface MerchantRequest {
  id: string;
  agent_id: string;
  agent_name: string;
  requested_count: number;
  estimated_daily_transactions: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantRequestQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  agent_id?: string;
}

export interface MerchantRequestResponse {
  status: number;
  success: boolean;
  message: string;
  data: MerchantRequest[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MerchantRequestDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: MerchantRequest;
}