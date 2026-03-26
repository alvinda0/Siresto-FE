import { apiClient } from "@/lib/axios";
import { TransferResponse, TransferQueryParams, TransferDetailResponse, Transfer } from "@/types/transfer";

class TransferService {
  async getTransfers(
    params?: TransferQueryParams
  ): Promise<TransferResponse> {
    const { data } = await apiClient.get<TransferResponse>(
      "/api/v1/internal/transfers",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch transfers");
  }

  async getTransferById(transferId: string): Promise<Transfer> {
    const { data } = await apiClient.get<TransferDetailResponse>(
      `/api/v1/internal/transfers/${transferId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch transfer details");
  }
}

export const transferService = new TransferService();
