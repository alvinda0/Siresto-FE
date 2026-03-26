// types/payment.ts

// QRIS Payment Request & Response Types
export interface CreateQRISPaymentRequest {
  amount: number;
  timeout: number;
  order_id?: string;
  username?: string;
  description?: string;
  metadata?: Record<string, any>;
  webhook_url?: string;
}

export interface QRISPaymentData {
  transaction_id: string;
  order_id: string;
  merchant_name: string;
  created_at: string;
  expired_at: string;
  amount: number;
  username: string;
  description: string;
  metadata?: Record<string, any>;
  qris_string: string;
  qris_image: string;
}

export interface CreateQRISPaymentResponse {
  success: boolean;
  message: string;
  data?: QRISPaymentData;
}