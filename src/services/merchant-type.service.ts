// services/merchant-type.service.ts
import { apiClient } from '@/lib/axios';
import {
    MerchantType,
    MerchantTypeResponse,
    MerchantTypeDetailResponse,
    MerchantTypeQueryParams,
    CreateMerchantTypePayload,
    UpdateMerchantTypePayload
} from '@/types/merchant-type';

class MerchantTypeService {
    /**
     * Get all merchant types with optional filters and pagination
     */
    async getMerchantTypes(params?: MerchantTypeQueryParams): Promise<MerchantTypeResponse> {
        const { data } = await apiClient.get<MerchantTypeResponse>(
            '/api/v1/merchant/types',
            { params }
        );

        if (data.success) {
            return data; // Return full response including metadata
        }

        throw new Error(data.message || 'Failed to fetch merchant types');
    }

    /**
     * Get merchant type by ID
     */
    async getMerchantTypeById(id: string): Promise<MerchantType> {
        const { data } = await apiClient.get<MerchantTypeDetailResponse>(
            `/api/v1/merchant/types/${id}`
        );

        if (data.success && data.data) {
            return Array.isArray(data.data) ? data.data[0] : data.data;
        }

        throw new Error(data.message || 'Failed to fetch merchant type');
    }

    /**
     * Create new merchant type
     */
    async createMerchantType(payload: CreateMerchantTypePayload): Promise<MerchantType> {
        const { data } = await apiClient.post<MerchantTypeDetailResponse>(
            '/api/v1/merchant/types',
            payload
        );

        if (data.success && data.data) {
            return Array.isArray(data.data) ? data.data[0] : data.data;
        }

        throw new Error(data.message || 'Failed to create merchant type');
    }

    /**
     * Update merchant type
     */
    async updateMerchantType(
        id: string,
        payload: UpdateMerchantTypePayload
    ): Promise<MerchantType> {
        const { data } = await apiClient.put<MerchantTypeDetailResponse>(
            `/api/v1/merchant/types/${id}`,
            payload
        );

        if (data.success && data.data) {
            return Array.isArray(data.data) ? data.data[0] : data.data;
        }

        throw new Error(data.message || 'Failed to update merchant type');
    }

    /**
     * Delete merchant type
     */
    async deleteMerchantType(id: string): Promise<void> {
        const { data } = await apiClient.delete<{ success: boolean; message: string }>(
            `/api/v1/merchant/types/${id}`
        );

        if (!data.success) {
            throw new Error(data.message || 'Failed to delete merchant type');
        }
    }

    /**
     * Get merchant types for select dropdown (simplified)
     */
    async getMerchantTypesForSelect(): Promise<MerchantType[]> {
        const response = await this.getMerchantTypes({ limit: 100 });
        return response.data || [];
    }
}

export const merchantTypeService = new MerchantTypeService();