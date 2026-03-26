// types/script.ts
export interface EngineSettings {
  id: number;
  partner_id: string;
  partner_name?: string;
  platform_id: string;
  platform_name?: string;
  agent_id: string;
  agent_name?: string;
  category: string;
  engine: string;
  code: string;
  data: Record<string, unknown>;
  url?: string;
  is_enable: boolean;
}

export interface EngineSettingsResponse {
  status: number;
  success: boolean;
  message: string;
  data: EngineSettings[];
}

export interface UpdateEngineSettingsRequest {
  is_enable: boolean;
}

export interface UpdateEngineSettingsResponse {
  status: number;
  success: boolean;
  message: string;
  data: {
    id: number;
    is_enable: boolean;
    message: string;
  };
}

export interface GenerateEngineRequest {
  agent: string;
  engine: string;
}

export interface GenerateEngineResponse {
  status: number;
  success: boolean;
  message: string;
}

export interface EngineBlueprintsResponse {
  status: number;
  success: boolean;
  message: string;
  data: string[];
}

export interface EditEngineDataRequest {
  data: Record<string, unknown>;
}

export interface EditEngineDataResponse {
  status: number;
  success: boolean;
  message: string;
}

export interface DeleteEngineSettingsResponse {
  status: number;
  success: boolean;
  message: string;
}