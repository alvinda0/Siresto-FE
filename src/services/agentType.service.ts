// services/agentType.service.ts
import { apiClient } from "@/lib/axios";
import {
  AgentType,
  AgentTypeResponse,
  AgentTypeDetailResponse,
  AgentTypeQueryParams,
  CreateAgentTypePayload,
  UpdateAgentTypePayload,
  DeleteAgentTypeResponse,
} from "@/types/agentType";

class AgentTypeService {
  /**
   * Get all agent types with optional filters
   * Returns full response with data and metadata
   */
  async getAgentTypes(
    params?: AgentTypeQueryParams
  ): Promise<AgentTypeResponse> {
    const { data } = await apiClient.get<AgentTypeResponse>(
      "/api/v1/agent/types",
      { params }
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch agent types");
  }

  /**
   * Get agent types for select dropdown (limited)
   */
  async getAgentTypesForSelect(): Promise<AgentType[]> {
    const { data } = await apiClient.get<AgentTypeResponse>(
      "/api/v1/agent/types",
      {
        params: { limit: 100 },
      }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch agent types");
  }

  /**
   * Get agent type by ID
   */
  async getAgentTypeById(id: string): Promise<AgentType> {
    const { data } = await apiClient.get<AgentTypeDetailResponse>(
      `/api/v1/agent/types/${id}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch agent type");
  }

  /**
   * Create new agent type
   */
  async createAgentType(payload: CreateAgentTypePayload): Promise<AgentType> {
    const { data } = await apiClient.post<AgentTypeDetailResponse>(
      "/api/v1/agent/types",
      payload
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to create agent type");
  }

  /**
   * Update existing agent type
   */
  async updateAgentType(
    id: string,
    payload: UpdateAgentTypePayload
  ): Promise<AgentType> {
    const { data } = await apiClient.put<AgentTypeDetailResponse>(
      `/api/v1/agent/types/${id}`,
      payload
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to update agent type");
  }

  /**
   * Delete agent type
   */
  async deleteAgentType(id: string): Promise<void> {
    const { data } = await apiClient.delete<DeleteAgentTypeResponse>(
      `/api/v1/agent/types/${id}`
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to delete agent type");
    }
  }
}

export const agentTypeService = new AgentTypeService();