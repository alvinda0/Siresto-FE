// services/transaction.service.ts
import { apiClient } from "@/lib/axios";
import {
  Transaction,
  TransactionResponse,
  TransactionDetailResponse,
  TransactionQueryParams,
  TransactionDownloadParams,
  AnalyticsResponse,
  AnalyticsQueryParams,
  ResendCallbackResponse,
  BotRetryResponse,
} from "@/types/transaction";

class TransactionService {
  async getTransactions(
    params?: TransactionQueryParams,
  ): Promise<TransactionResponse> {
    const { data } = await apiClient.get<TransactionResponse>(
      "/api/v1/internal/transactions",
      { params },
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch transactions");
  }

  async getTransactionById(transactionUuid: string): Promise<Transaction> {
    const { data } = await apiClient.get<TransactionDetailResponse>(
      `/api/v1/internal/transactions/${transactionUuid}`,
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch transaction details");
  }

  async downloadTransactions(
    params?: TransactionDownloadParams,
  ): Promise<Blob> {
    const response = await apiClient.post(
      "/api/v1/internal/transactions/download",
      params, // Kirim sebagai body, bukan query params
      {
        responseType: "blob",
      },
    );

    return response.data;
  }

  /**
   * Get transaction analytics with optional filters
   */
  async getAnalytics(
    params?: AnalyticsQueryParams,
  ): Promise<AnalyticsResponse> {
    const { data } = await apiClient.get<AnalyticsResponse>(
      "/api/v1/internal/transactions/analytics",
      { params },
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch transaction analytics");
  }

  async updateProcessingStatus(
    transactionUuid: string,
    processStatus: string,
    reason: string,
  ): Promise<{ success: boolean; message: string }> {
    const { data } = await apiClient.patch(
      `/api/v1/internal/transactions/${transactionUuid}/process-status`,
      {
        process_status: processStatus,
        reason: reason,
      },
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to update processing status");
  }

  async resendCallback(
    transactionUuid: string,
  ): Promise<ResendCallbackResponse> {
    const { data } = await apiClient.post<ResendCallbackResponse>(
      `/api/v1/internal/transactions/${transactionUuid}/resend-callback`,
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to resend callback");
  }

  async GetGroupTransactionSummary(params: {
    StartDate: string;
    EndDate: string;
  }): Promise<{
    start_date: string;
    end_date: string;
    total_transaction_amount: number;
    total_transaction_final_amount: number;
    total_agent_fee: number;
    total_platform_fee: number;
    rows: {
      platform_name: string;
      platform_id: string;

      partner_name: string;
      partner_id: string;

      agent_name: string;
      agent_id: string;

      merchant_name: string;
      merchant_id: string;

      created_at: string; // time.Time → ISO string
      status: string;
      process_status: string;

      transaction_amount: number;
      transaction_final_amount: number;
      agent_fee: number;
      platform_fee: number;

      agent_commission_fee: number;
    }[];
  }> {
    const { data } = await apiClient.post(
      "/api/v1/internal/analytics/group-transaction-summary",
      params,
    );

    if (data?.success) {
      return data.data;
    }

    throw new Error(
      data?.message || "Failed to fetch group transaction summary",
    );
  }

  async botRetry(transactionUuid: string): Promise<BotRetryResponse> {
    const { data } = await apiClient.post<BotRetryResponse>(
      `/api/v1/internal/transactions/${transactionUuid}/bot-retry`,
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to queue bot retry");
  }
}

export const transactionService = new TransactionService();
