// services/settlement-merchant.service.ts

import { apiClient } from '@/lib/axios';
import {
    SettlementMerchant,
    SettlementMerchantResponse,
    SettlementMerchantDetailResponse,
    SettlementMerchantQueryParams,
    CreateSettlementMerchantPayload,
    CreateSettlementMerchantResponse,
    BulkSettlementMerchantResponse,
} from '@/types/settlement-merchant';

class SettlementMerchantService {
    /**
     * Get all settlement merchants with optional filters
     * Returns full response including metadata for pagination
     */
    async getSettlements(params?: SettlementMerchantQueryParams): Promise<SettlementMerchantResponse> {
        const { data } = await apiClient.get<SettlementMerchantResponse>(
            '/api/v1/settlement/merchant',
            { params }
        );

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch settlement merchants');
        }

        return data;
    }

    /**
     * Get settlement merchant by ID
     */
    async getSettlementById(settlementId: string): Promise<SettlementMerchant> {
        const { data } = await apiClient.get<SettlementMerchantDetailResponse>(
            `/api/v1/settlement/merchant/${settlementId}`
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Failed to fetch settlement detail');
        }

        return data.data;
    }

    /**
     * Create new settlement merchant
     */
    async createSettlement(payload: CreateSettlementMerchantPayload): Promise<SettlementMerchant> {
        const { data } = await apiClient.post<CreateSettlementMerchantResponse>(
            '/api/v1/settlement/merchant',
            payload
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Failed to create settlement');
        }

        return data.data;
    }

    /**
     * Create bulk settlement merchants
     */
    async createBulkSettlement(file: File, pin: string): Promise<BulkSettlementMerchantResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pin', pin);

        const { data } = await apiClient.post<BulkSettlementMerchantResponse>(
            '/api/v1/settlement/merchant/bulk',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!data.success) {
            throw new Error(data.message || 'Failed to create bulk settlement');
        }

        return data;
    }

    /**
     * Download settlement merchant template
     */
    async downloadTemplate(): Promise<void> {
        const response = await apiClient.get(
            '/api/v1/settlement/merchant/template',
            { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = 'settlement_merchant_template.xlsx';

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    /**
     * Download merchant estimated settlement
     */
    async downloadMerchantEstimated(vendorId: string): Promise<void> {
        const response = await apiClient.get(
            '/api/v1/internal/estimated/merchant/download',
            { 
                params: { vendor_id: vendorId },
                responseType: 'blob' 
            }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const date = new Date().toISOString().split('T')[0];
        const filename = `merchant_estimated_settlement_${date}.xlsx`;

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
}

export const settlementMerchantService = new SettlementMerchantService();