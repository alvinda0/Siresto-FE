// services/audit.service.ts

import { apiClient } from '@/lib/axios';
import {
  AuditLog,
  AuditLogResponse,
  AuditLogDetailResponse,
  AuditLogQueryParams,
} from '@/types/audit';

class AuditService {
  /**
   * Get all audit logs with optional filters
   */
  async getAuditLogs(params?: AuditLogQueryParams): Promise<AuditLogResponse> {
    const { data } = await apiClient.get<AuditLogResponse>(
      '/api/v1/logs',
      { params }
    );
    return data;
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(logId: string): Promise<AuditLog> {
    const { data } = await apiClient.get<AuditLogDetailResponse>(
      `/api/v1/logs/${logId}`
    );
    return data.data;
  }
}

export const auditService = new AuditService();
