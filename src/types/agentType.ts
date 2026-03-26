// types/agentType.ts
export interface AgentType {
  agent_type_id: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AgentTypeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AgentTypeResponse {
  success: boolean;
  message: string;
  data: AgentType[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AgentTypeDetailResponse {
  success: boolean;
  message: string;
  data: AgentType;
}

export interface CreateAgentTypePayload {
  type: string;
  description: string;
}

export interface UpdateAgentTypePayload {
  type: string;
  description: string;
}

export interface DeleteAgentTypeResponse {
  success: boolean;
  message: string;
}