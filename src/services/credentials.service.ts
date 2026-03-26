// services/credentials.service.ts

import { apiClient } from "@/lib/axios";
import {
  AgentCredentialResponse,
  AgentCredentialQueryParams,
  MerchantCredentialResponse,
  MerchantCredentialQueryParams,
} from "@/types/credentials";

class CredentialsService {
  /**
   * Get all agent credentials with pagination and filters
   * Returns full response with data and metadata
   */
  async getAgentCredentials(
    params?: AgentCredentialQueryParams
  ): Promise<AgentCredentialResponse> {
    const { data } = await apiClient.get<AgentCredentialResponse>(
      "/api/v1/internal/credentials/agent",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch agent credentials");
  }

  /**
   * Get all merchant credentials with filters (NO PAGINATION)
   * Returns full response with data and metadata
   */
  async getMerchantCredentials(
    params?: MerchantCredentialQueryParams
  ): Promise<MerchantCredentialResponse> {
    const { data } = await apiClient.get<MerchantCredentialResponse>(
      "/api/v1/internal/credentials/merchant",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch merchant credentials");
  }
}

export const credentialsService = new CredentialsService();