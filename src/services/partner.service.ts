// services/partner.service.ts

import { apiClient } from "@/lib/axios";
import { Partner, PartnerResponse } from "@/types/partner";

class PartnerService {
    /**
     * Get all partners for dropdown select
     */
    async getPartners(): Promise<Partner[]> {
        const { data } = await apiClient.get<PartnerResponse>(
            "/api/v1/partners",
            {
                params: { page: 1, limit: 100 },
            }
        );

        if (data.success && data.data) {
            return data.data;
        }

        throw new Error(data.message || "Failed to fetch partners");
    }
}

export const partnerService = new PartnerService();