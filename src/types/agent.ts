// types/agent.ts

export interface Agent {
  hide_fee: number;
  admin_fee: number;
  agent_id: string;
  name: string;
  agent_type_id: string;
  agent_type_name: string;
  email: string;
  phone_number: string;
  platform_id: string;
  platform_name: string;
  vendor_id?: string;
  vendor_name?: string;
  fee: number;
  status: "ACTIVE" | "PENDING" | "REJECTED" | "INACTIVE";
  created_at: string;
  updated_at: string;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data: Agent[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AgentDetailResponse {
  success: boolean;
  message: string;
  data: Agent;
}

export interface CreateAgentPayload {
  name: string;
  agent_type_id: string;
  email: string;
  phone_number: string;
  platform_id: string;
  fee: number;
  hide_fee?: number;
  status?: string;
  admin_fee?: number;
}

export interface CreateAgentResponse {
  success: boolean;
  message: string;
  data: Agent;
}

export interface UpdateAgentPayload {
  name?: string;
  email?: string;
  phone_number?: string;
  agent_type_id?: string;
  platform_id?: string;
  fee?: number;
  hide_fee?: number;
  status?: string;
  reason?: string | null;
  admin_fee?: number;
}

export interface UpdateAgentResponse {
  success: boolean;
  message: string;
  data: Agent;
}

export interface DeleteAgentResponse {
  success: boolean;
  message: string;
}

export interface AgentType {
  agent_type_id: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
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

// Query params interface
export interface AgentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  platform_id?: string;
  status?: string;
  agent_type_id?: string;
  agent_id?: string;
}