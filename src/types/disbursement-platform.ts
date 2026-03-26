// types/disbursement-platform.ts
export interface DisbursementPlatform {
  disbursement_id: string;
  platform_id: string;
  platform_name: string;
  vendor_name?: string;
  amount: number;
  bank_name: string;
  bank_code: string;
  account_name: string;
  account_number: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "MANUAL";
  type: "IDR" | "USDT";
  file_id?: string;
  file_url?: string;
  admin_cost: number;
  total_disbursements: number;
  before_wallet?: number;
  after_wallet?: number;
  reason?: string;
  process_by?: string;
  process_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DisbursementPlatformQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  platform_id?: string;
}

export interface DisbursementPlatformSummary {
  status: string;
  count: number;
  total_disbursement: number;
}

export interface DisbursementPlatformTotal {
  count: number;
  total_disbursement: number;
}

export interface DisbursementPlatformResponse {
  status: number;
  success: boolean;
  message: string;
  data: DisbursementPlatform[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  summary: DisbursementPlatformSummary[] | null;
  total: DisbursementPlatformTotal;
}

export interface DisbursementPlatformDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: DisbursementPlatform;
}

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