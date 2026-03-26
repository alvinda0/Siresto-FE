// services/platform.service.ts

import { apiClient } from "@/lib/axios";
import {
    Platform,
    PlatformResponse,
    SinglePlatformResponse,
    CreatePlatformPayload,
    CreatePlatformResponse,
    UpdatePlatformPayload,
    UpdatePlatformResponse,
    PlatformQueryParams,
} from "@/types/platform";

class PlatformService {
    /**
     * Get all platforms with optional filters
     * Returns full response including metadata for pagination
     */
    async getPlatforms(params?: PlatformQueryParams): Promise<PlatformResponse> {
        const { data } = await apiClient.get<PlatformResponse>(
            "/api/v1/internal/platforms",
            { params }
        );

        if (data.success) {
            return data; // Return full response including metadata
        }

        throw new Error(data.message || "Failed to fetch platforms");
    }

    /**
     * Get platforms for select dropdown (without pagination metadata)
     */
    async getPlatformsForSelect(): Promise<Platform[]> {
        const { data } = await apiClient.get<PlatformResponse>(
            '/api/v1/internal/platforms',
            { params: { limit: 100, page: 1 } }
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || 'Failed to fetch platforms');
    }

    /**
     * Get all platforms (fetch multiple pages if needed)
     */
    async getAllPlatforms(): Promise<Platform[]> {
        let allPlatforms: Platform[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data } = await apiClient.get<PlatformResponse>(
                '/api/v1/internal/platforms',
                { params: { limit: 100, page } }
            );

            if (data.success && data.data) {
                allPlatforms = [...allPlatforms, ...data.data];
                
                // Check if we have more pages
                if (data.metadata && page < data.metadata.total_pages) {
                    page++;
                } else {
                    hasMore = false;
                }
            } else {
                throw new Error(data.message || 'Failed to fetch platforms');
            }
        }

        // Limit to 100 platforms max
        return allPlatforms.slice(0, 100);
    }

    /**
     * Get platform by ID
     */
    async getPlatformById(platformId: string): Promise<Platform> {
        const { data } = await apiClient.get<SinglePlatformResponse>(
            `/api/v1/internal/platforms/${platformId}`
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to fetch platform details");
    }

    /**
     * Create new platform
     */
    async createPlatform(payload: CreatePlatformPayload): Promise<Platform> {
        const { data } = await apiClient.post<CreatePlatformResponse>(
            "/api/v1/internal/platforms",
            payload
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to create platform");
    }

    /**
     * Update existing platform
     */
    async updatePlatform(
        platformId: string,
        payload: UpdatePlatformPayload
    ): Promise<Platform> {
        const { data } = await apiClient.put<UpdatePlatformResponse>(
            `/api/v1/internal/platforms/${platformId}`,
            payload
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to update platform");
    }

    /**
     * Delete platform
     */
    async deletePlatform(platformId: string): Promise<void> {
        const { data } = await apiClient.delete<{ success: boolean; message: string }>(
            `/api/v1/internal/platforms/${platformId}`
        );

        if (!data.success) {
            throw new Error(data.message || "Failed to delete platform");
        }
    }
}

export const platformService = new PlatformService();