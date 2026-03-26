// types/credentials.ts

// Agent Credentials Types
export interface AgentCredential {
  agent_id: string;
  name: string;
  status: string;
  api_key: string;
  secret_key: string;
  webhook_secret: string;
  created_at: string;
  updated_at: string;
}

export interface AgentCredentialQueryParams {
  page?: number;
  limit?: number;
  name?: string;
  status?: string;
}

export interface AgentCredentialResponse {
  success: boolean;
  message: string;
  data: AgentCredential[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Merchant Credentials Types
export interface MerchantCredential {
  merchant_id: string;
  name: string;
  status: string;
  environment: string;
  prod_api_key: string;
  prod_callback_key: string;
  dev_api_key: string;
  dev_callback_key: string;
  merchant_token: string;
  created_at: string;
  updated_at: string;
}

export interface MerchantCredentialQueryParams {
  name?: string;
  status?: string;
  environment?: string;
}

export interface MerchantCredentialResponse {
  success: boolean;
  message: string;
  data: MerchantCredential[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}