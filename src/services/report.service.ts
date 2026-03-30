import { apiClient } from '@/lib/axios';
import { TransactionReportResponse, TransactionReportParams } from '@/types/report';

class ReportService {
  /**
   * Get transaction reports
   */
  async getTransactionReports(params?: TransactionReportParams): Promise<TransactionReportResponse> {
    const { data } = await apiClient.get<TransactionReportResponse>(
      '/api/v1/external/reports/transactions',
      { params }
    );
    return data;
  }
}

export const reportService = new ReportService();
