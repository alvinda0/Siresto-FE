// types/transaction.ts
export interface Transaction {
  transaction_uuid: string;
  source: string;
  order_id: string;
  vendor_transaction_id: string | null;
  created_at: string;
  updated_at: string;
  expired_at: string | null;
  paid_at: string | null;
  username: string | null;
  reference_number: string | null;
  amount: number;
  final_amount: number;
  currency: string;
  method: string;
  qris_string?: string | null;
  qris_image?: string | null;
  status: "pending" | "paid" | "expire" | "fail" | "cancel";
  process_status: string | null;
  webhook_url?: string;
  creator_name: string | null;
  description: string | null;
  updated_by: string | null;
  updated_name: string | null;
  fee?: Record<string, any>;
  metadata?: Record<string, any>;
  partner_id?: string;
  partner_name?: string;
  platform_id?: string;
  platform_name?: string;
  agent_id?: string;
  agent_name?: string;
  merchant_id?: string;
  merchant_name?: string;
  vendor_id?: string;
  vendor_name?: string;
  webhook_queue_payload_status?: string;
  webhook_queue_payload_description?: string;
  webhook_queue_status?: string;
  webhook_queue_retry_count?: number;
  webhook_queue_max_retries?: number;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_dir?: string;
  search?: string;
  status?: string;
  processing_status?: string;
  method?: string;
  platform_id?: string;
  agent_id?: string;
  merchant_id?: string;
  vendor_id?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data: Transaction[];
  metadata?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TransactionDetailResponse {
  success: boolean;
  message: string;
  data: Transaction;
}

export interface TransactionDownloadParams {
  start_time?: string;
  end_time?: string;
  status?: string;
  platform_id?: string;
  agent_id?: string;
  merchant_id?: string;
  vendor_id?: string;
}

// Analytics Types
export interface StatusData {
  status: string;
  count: number;
  amount:number
  final_amount: number;
}

export interface DailyData {
  date: string;
  statuses: StatusData[];
}

export interface AnalyticsSummary {
  count: number;
  amount: number
  final_amount: number;
}

export interface AnalyticsData {
  period: string;
  start_date: string;
  end_date: string;
  daily: DailyData[];
  summary: StatusData[];
  total: AnalyticsSummary;
}

export interface AnalyticsResponse {
  success: boolean;
  message: string;
  data: AnalyticsData;
}

export interface AnalyticsQueryParams {
  status?: string;
  merchant_id?: string;
  platform_id?: string;
  partner_id?: string;
  agent_id?: string;
  vendor_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface ResendCallbackResponse {
  success: boolean;
  message: string;
  data: {
    transaction_uuid: string;
  };
}

export interface BotRetryResponse {
  success: boolean;
  message: string;
  data: {
    transaction_uuid: string;
  };
}