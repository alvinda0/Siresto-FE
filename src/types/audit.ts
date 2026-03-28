// types/audit.ts

export interface AuditLog {
  id: string;
  method: string;
  path: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  user_agent: string;
  access_from: string;
  user_id?: string;
  company_id?: string;
  request_body?: string;
  response_body?: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface AuditLogQueryParams {
  page?: number;
  limit?: number;
  method?: string;
  path?: string;
  status_code?: number;
  user_id?: string;
  company_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface AuditLogDetailResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: AuditLog;
}
