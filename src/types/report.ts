export interface TransactionReport {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  table_number: string;
  order_method: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  change_amount: number;
  company_name: string;
  branch_name: string;
  created_at: string;
  paid_at?: string;
  promo_code?: string;
}

export interface TransactionReportResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: TransactionReport[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface TransactionReportParams {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  search?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  order_method?: string;
}
