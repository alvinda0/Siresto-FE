// services/payment.service.ts
import {
  CreateQRISPaymentRequest,
  CreateQRISPaymentResponse,
} from "@/types/payment";

class PaymentService {
  /**
   * Create QRIS Payment Transaction
   * @param api_key - Agent API Key
   * @param secret_key - Agent Secret Key
   * @param request - Payment request data
   */
  async createQRISPayment(
    api_key: string,
    secret_key: string,
    request: CreateQRISPaymentRequest
  ): Promise<CreateQRISPaymentResponse> {
    try {
      const response = await fetch("/api/payments/qris", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key,
          secret_key,
          ...request,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create QRIS payment");
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const paymentService = new PaymentService();