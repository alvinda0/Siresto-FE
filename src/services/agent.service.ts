// services/agent.service.ts
import { apiClient } from "@/lib/axios";
import {
  Agent,
  AgentDetailResponse,
  AgentResponse,
  CreateAgentPayload,
  CreateAgentResponse,
  UpdateAgentPayload,
  UpdateAgentResponse,
  AgentType,
  AgentTypeResponse,
  AgentQueryParams,
  DeleteAgentResponse,
} from "@/types/agent";

class AgentService {
  /**
   * Get all agents with optional filters
   * Returns full response with data and metadata
   */
  async getAgents(params?: AgentQueryParams): Promise<AgentResponse> {
    const { data } = await apiClient.get<AgentResponse>(
      "/api/v1/internal/agents",
      { params }
    );

    if (data.success) {
      return data; // Return full response including metadata
    }

    throw new Error(data.message || "Failed to fetch agents");
  }

  /**
   * Get agents for select dropdown (limited)
   */
  async getAgentsForSelect(): Promise<Agent[]> {
    const { data } = await apiClient.get<AgentResponse>(
      "/api/v1/internal/agents",
      {
        params: { limit: 100 },
      }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch agents");
  }

  /**
   * Get agent by ID
   */
  async getAgentById(agentId: string): Promise<Agent> {
    const { data } = await apiClient.get<AgentDetailResponse>(
      `/api/v1/internal/agents/${agentId}`
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch agent details");
  }

  /**
   * Create new agent
   */
  async createAgent(payload: CreateAgentPayload): Promise<Agent> {
    const { data } = await apiClient.post<CreateAgentResponse>(
      "/api/v1/internal/agents",
      payload
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to create agent");
  }

  /**
   * Update existing agent
   */
  async updateAgent(
    agentId: string,
    payload: UpdateAgentPayload
  ): Promise<Agent> {
    const { data } = await apiClient.put<UpdateAgentResponse>(
      `/api/v1/internal/agents/${agentId}`,
      payload
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to update agent");
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string): Promise<void> {
    const { data } = await apiClient.delete<DeleteAgentResponse>(
      `/api/v1/internal/agents/${agentId}`
    );

    if (!data.success) {
      throw new Error(data.message || "Failed to delete agent");
    }
  }

  /**
   * Get all agent types
   */
  async getAgentTypes(): Promise<AgentType[]> {
    const { data } = await apiClient.get<AgentTypeResponse>(
      "/api/v1/agent/types",
      {
        params: { page: 1, limit: 100 },
      }
    );

    if (data.success && data.data) {
      return data.data;
    }

    throw new Error(data.message || "Failed to fetch agent types");
  }

  /**
   * Get all agent types (fetch multiple pages if needed)
   */
  async getAllAgentTypes(): Promise<AgentType[]> {
    let allAgentTypes: AgentType[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data } = await apiClient.get<AgentTypeResponse>(
        "/api/v1/agent/types",
        { params: { limit: 50, page } }
      );

      if (data.success && data.data) {
        allAgentTypes = [...allAgentTypes, ...data.data];
        
        // Check if we have more pages
        if (data.metadata && page < data.metadata.total_pages) {
          page++;
        } else {
          hasMore = false;
        }
      } else {
        throw new Error(data.message || 'Failed to fetch agent types');
      }
    }

    // Limit to 100 agent types max
    return allAgentTypes.slice(0, 100);
  }
}

export const agentService = new AgentService();