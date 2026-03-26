// types/bank-merchant.ts
export interface BankMerchant {
  bank_merchant_id: string;
  account_number: string;
  bank_name: string;
  account_name: string;
  bank_code: string;
  status: "Accepted" | "Pending" | "Rejected" | "Revised";
  merchant_id: string;
  merchant_name: string;
  created_by: string;
  created_by_name: string;
  accepted_by?: string;
  accepted_by_name?: string;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BankMerchantResponse {
  success: boolean;
  message: string;
  data: BankMerchant[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface BankMerchantDetailResponse {
  success: boolean;
  message: string;
  data: BankMerchant;
}

export interface BankMerchantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  merchant_id?: string;
  agent_id?: string;
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
