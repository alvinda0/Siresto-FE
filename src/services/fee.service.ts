// services/fee.service.ts
import { apiClient } from "@/lib/axios";
import {
    Fee,
    FeeResponse,
    SingleFeeResponse,
    UpdateFeePayload,
    UpdateFeeResponse,
    FeeQueryParams,
} from "@/types/fee";

class FeeService {
    /**
     * Get all fees with optional filters and pagination
     */
    async getFees(params?: FeeQueryParams): Promise<FeeResponse> {
        const { data } = await apiClient.get<FeeResponse>(
            "/api/v1/internal/fees",
            { params }
        );

        if (data.success) {
            return data; // Return full response including metadata
        }

        throw new Error(data.message || "Failed to fetch fees");
    }

    /**
     * Get fee by agent ID
     */
    async getFeeById(agentId: string): Promise<Fee> {
        const { data } = await apiClient.get<SingleFeeResponse>(
            `/api/v1/internal/fees/${agentId}`
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to fetch fee details");
    }

    /**
     * Update existing fee
     */
    async updateFee(
        agentId: string,
        payload: UpdateFeePayload
    ): Promise<Fee> {
        const { data } = await apiClient.put<UpdateFeeResponse>(
            `/api/v1/internal/fees/${agentId}`,
            payload
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to update fee");
    }
}

export const feeService = new FeeService();