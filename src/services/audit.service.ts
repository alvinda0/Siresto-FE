// services/audit.service.ts

import { apiClient } from "@/lib/axios";
import {
  AuditLog,
  AuditLogResponse,
  SingleAuditLogResponse,
  AuditLogQueryParams,
} from "@/types/audit";

class AuditService {
  /**
   * Get all audit logs with optional filters
   * Returns full response with data and metadata
   */
  async getAuditLogs(
    params?: AuditLogQueryParams
  ): Promise<AuditLogResponse> {
    const { data } = await apiClient.get<AuditLogResponse>(
      "/api/v1/audit/trail",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch audit logs");
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(auditId: string): Promise<AuditLog> {
    const { data } = await apiClient.get<SingleAuditLogResponse>(
      `/api/v1/audit/trail/${auditId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch audit log details");
  }
}

export const auditService = new AuditService();