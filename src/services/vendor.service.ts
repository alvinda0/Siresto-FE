// services/vendor.service.ts

import { apiClient } from '@/lib/axios';
import {
    Vendor,
    VendorResponse,
    VendorDetailResponse,
    VendorQueryParams,
    CreateVendorPayload,
    UpdateVendorPayload,
} from '@/types/vendor';

class VendorService {
    /**
     * Get all vendors with optional filters
     * Returns full response including metadata for pagination
     */
    async getVendors(params?: VendorQueryParams): Promise<VendorResponse> {
        const { data } = await apiClient.get<VendorResponse>(
            '/api/v1/internal/vendors',
            { params }
        );

        if (data.success) {
            return data; // Return full response including metadata
        }

        throw new Error(data.message || 'Failed to fetch vendors');
    }

    /**
     * Get vendors for select dropdown (without pagination metadata)
     */
    async getVendorsForSelect(): Promise<Vendor[]> {
        const { data } = await apiClient.get<VendorResponse>(
            '/api/v1/internal/vendors',
            { params: { limit: 100, page: 1 } }
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || 'Failed to fetch vendors');
    }

    /**
     * Get vendor by ID
     */
    async getVendorById(vendorId: string): Promise<Vendor> {
        const { data } = await apiClient.get<VendorDetailResponse>(
            `/api/v1/internal/vendors/${vendorId}`
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || 'Failed to fetch vendor');
    }
}

export const vendorService = new VendorService();