// services/pin.service.ts
import { apiClient } from "@/lib/axios";
import {
  CreatePinPayload,
  DeletePinPayload,
  PinActionResponse,
  PinCheckResponse,
  ResetPinPayload,
  ResetPinResponse,
  UpdatePinPayload,
} from "@/types/pin";

class PinService {
  async checkPinStatus(): Promise<boolean> {
    const { data } = await apiClient.get<PinCheckResponse>("/api/v1/pin/check");
    return data.data.has_pin;
  }

  async createPin(payload: CreatePinPayload): Promise<void> {
    await apiClient.post<PinActionResponse>("/api/v1/pin", payload);
  }

  async updatePin(payload: UpdatePinPayload): Promise<void> {
    await apiClient.put<PinActionResponse>("/api/v1/pin", payload);
  }

  async deletePin(payload: DeletePinPayload): Promise<void> {
    await apiClient.delete<PinActionResponse>("/api/v1/pin", {
      data: payload,
    });
  }

  async resetPin(payload: ResetPinPayload): Promise<void> {
    await apiClient.post<ResetPinResponse>("/api/v1/pin/reset", payload);
  }
}

export const pinService = new PinService();