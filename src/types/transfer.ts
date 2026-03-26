export interface Transfer {
  id: string;
  from_id: string;
  to_id: string;
  transfer_by: string;
  transfer_by_name: string;
  from_merchant_id: string;
  from_merchant_name: string;
  to_merchant_id: string;
  to_merchant_name: string;
  agent_id: string;
  agent_name: string;
  from_before: number;
  from_after: number;
  to_before: number;
  to_after: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface TransferResponse {
  status: number;
  success: boolean;
  message: string;
  data: Transfer[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface TransferDetailResponse {
  status: number;
  success: boolean;
  message: string;
  data: Transfer;
}

export interface TransferQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  merchant_id?: string;
  agent_id?: string;
  start_date?: string;
  end_date?: string;
}
