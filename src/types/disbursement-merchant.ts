// types/disbursement-merchant.ts
export interface DisbursementMerchant {
  disbursement_id: string;
  merchant_id: string;
  merchant_name: string;
  vendor_name?: string;
  vendor_id?: string;
  amount: number;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL";
  processing_status?: string;
  type: "IDR" | "USDT";
  channel?: string;
  file_id?: string;
  file_url?: string;
  admin_cost: number;
  total_disbursements: number;
  before_wallet: number;
  after_wallet: number;
  reason?: string;
  process_by?: string;
  process_by_name?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DisbursementMerchantQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string; // IDR atau USDT
  merchant_id?: string;
  vendor_id?: string;
  channel?: string; // api, script, website
}

export interface DisbursementMerchantSummary {
  status: string;
  count: number;
  total_disbursement: number;
}

export interface DisbursementMerchantTotal {
  count: number;
  total_disbursement: number;
}

export interface DisbursementMerchantResponse {
  status: number;
  success: boolean;
  message: string;
  data: DisbursementMerchant[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: DisbursementMerchantSummary[];
  total: DisbursementMerchantTotal;
}

export interface DisbursementMerchantDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: DisbursementMerchant;
}

// types/disbursement-merchant.ts - Tambahkan interface baru di akhir file

export interface BulkApproveRequest {
  reason: string;
  file: File;
  pin: string;
}

export interface BulkApproveResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    approved_count: number;
    disbursement_ids: string[];
    reason: string;
    report_url: string;
  };
}

export interface BulkRejectRequest {
  disbursement_ids: string[];
  reason: string;
}

export interface BulkRejectResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    rejected_count: number;
    disbursement_ids: string[];
    reason: string;
  };
}

export interface BulkProcessingRequest {
  disbursement_ids: string[];
}

export interface BulkProcessingResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    processing_count: number;
    disbursement_ids: string[];
  };
}