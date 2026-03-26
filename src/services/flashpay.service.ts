import { apiClient } from "@/lib/axios";
import { 
  FlashpayBalance, 
  FlashpayBalancesResponse,
  CombineBalancePayload,
  CombineBalanceResponse 
} from "@/types/flashpay";

class FlashpayService {
  /**
   * Get all flashpay balances
   * Returns full response with data
   */
  async getBalances(): Promise<FlashpayBalancesResponse> {
    const { data } = await apiClient.get<FlashpayBalancesResponse>(
      "/api/v1/flashpay/balances"
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch flashpay balances");
  }

  /**
   * Get flashpay balances as array only
   */
  async getBalancesArray(): Promise<FlashpayBalance[]> {
    const { data } = await apiClient.get<FlashpayBalancesResponse>(
      "/api/v1/flashpay/balances"
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch flashpay balances");
  }

  /**
   * Combine balance from vendor to merchant wallet
   * Requires 2FA code
   */
  async combineBalance(payload: CombineBalancePayload): Promise<CombineBalanceResponse> {
    const { data } = await apiClient.post<CombineBalanceResponse>(
      "/api/v1/internal/transfers/combine",
      payload
    );

    if (data.success) {
      return data;
    }

    // Handle error response
    if (data.error) {
      throw new Error(data.error.message || "Failed to combine balance");
    }

    throw new Error(data.message || "Failed to combine balance");
  }
}

export const flashpayService = new FlashpayService();
