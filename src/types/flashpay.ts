export interface FlashpayBalance {
  wallet_id: string;
  merchant_id: string;
  merchant_name: string;
  vendor_name: string;
  available_balance: number;
  pending_balance: number;
  total_balance: number;
  created_at: string;
  updated_at: string;
}

export interface FlashpayBalancesResponse {
  status: number;
  success: boolean;
  message: string;
  data: FlashpayBalance[];
}

export interface CombineBalancePayload {
  to_wallet_id: string;
  two_fa: string;
}

export interface CombineBalanceResponse {
  status: number;
  success: boolean;
  message: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}
