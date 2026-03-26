// services/script.service.ts
import { apiClient } from "@/lib/axios";
import {
  EngineSettingsResponse,
  UpdateEngineSettingsRequest,
  UpdateEngineSettingsResponse,
  GenerateEngineRequest,
  GenerateEngineResponse,
  EngineBlueprintsResponse,
  EditEngineDataRequest,
  EditEngineDataResponse,
  DeleteEngineSettingsResponse,
} from "@/types/script";

class ScriptService {
  async getEngineSettings(params?: {
    category?: string;
    engine?: string;
    code?: string;
    is_enable?: boolean;
  }): Promise<EngineSettingsResponse> {
    const { data } = await apiClient.get<EngineSettingsResponse>(
      "/api/v1/internal/engine-settings",
      { params },
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to fetch engine settings");
  }

  async updateEngineSettings(
    id: number,
    payload: UpdateEngineSettingsRequest,
  ): Promise<UpdateEngineSettingsResponse> {
    const { data } = await apiClient.put<UpdateEngineSettingsResponse>(
      `/api/v1/internal/engine-settings/${id}`,
      payload,
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to update engine settings");
  }

  async getEngineBlueprints(): Promise<string[]> {
    const { data } = await apiClient.get<EngineBlueprintsResponse>(
      "/api/v1/engine-blueprints/engines",
    );

    if (data.success) return data.data ?? [];
    throw new Error(data.message || "Failed to fetch engine blueprints");
  }

  async generateEngineSettings(
    payload: GenerateEngineRequest,
  ): Promise<GenerateEngineResponse> {
    const { data } = await apiClient.post<GenerateEngineResponse>(
      "/api/v1/engine-settings/generate",
      payload,
    );

    if (data.success) {
      return data;
    }

    throw new Error(data.message || "Failed to generate engine settings");
  }

  async editEngineData(
    id: number,
    payload: EditEngineDataRequest,
  ): Promise<EditEngineDataResponse> {
    const { data } = await apiClient.patch<EditEngineDataResponse>(
      `/api/v1/engine-settings/${id}/data`,
      payload,
    );

    if (data.success) return data;
    throw new Error(data.message || "Failed to update engine data");
  }

  // ✅ NEW: Delete engine settings
  async deleteEngineSettings(
    id: number,
  ): Promise<DeleteEngineSettingsResponse> {
    const { data } = await apiClient.delete<DeleteEngineSettingsResponse>(
      `/api/v1/engine-settings/${id}`,
    );

    if (data.success) return data;
    throw new Error(data.message || "Failed to delete engine settings");
  }
}

export const scriptService = new ScriptService();
