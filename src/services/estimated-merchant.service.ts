// services/estimated-merchant.service.ts
import { apiClient } from '@/lib/axios';
import {
    EstimatedMerchant,
    EstimatedMerchantResponse
} from '@/types/estimated-merchant';

class EstimatedMerchantService {
    async getEstimatedMerchants(limit: number = 500): Promise<EstimatedMerchant[]> {
        const { data } = await apiClient.get<EstimatedMerchantResponse>(
            '/api/v1/internal/estimated/merchant',
            { params: { limit } }
        );

        if (data.success && data.data) {
            return Array.isArray(data.data) ? data.data : [data.data];
        }

        throw new Error(data.message || 'Failed to fetch estimated merchants');
    }

    async getEstimatedMerchantById(estimatedId: string): Promise<EstimatedMerchant> {
        const { data } = await apiClient.get<EstimatedMerchantResponse>(
            `/api/v1/internal/estimated/merchant/${estimatedId}`
        );

        if (data.success && data.data) {
            return Array.isArray(data.data) ? data.data[0] : data.data;
        }

        throw new Error(data.message || 'Failed to fetch estimated merchant');
    }
}

export const estimatedMerchantService = new EstimatedMerchantService();