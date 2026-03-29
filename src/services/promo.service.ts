// services/promo.service.ts

import { apiClient } from '@/lib/axios';

export interface Promo {
  id: string;
  company_id: string;
  company_name: string;
  branch_id: string | null;
  branch_name: string | null;
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_discount: number | null;
  min_transaction: number;
  quota: number;
  used_count: number;
  remaining_quota: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_expired: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromoResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Promo[];
  meta: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

export interface CreatePromoRequest {
  name: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_discount?: number | null;
  min_transaction: number;
  quota: number;
  start_date: string;
  end_date: string;
  branch_id?: string | null;
  is_active: boolean;
}

export interface UpdatePromoRequest extends CreatePromoRequest {}

class PromoService {
  /**
   * Get promos with pagination
   */
  async getPromos(params?: { page?: number; limit?: number }): Promise<PromoResponse> {
    const { data } = await apiClient.get<PromoResponse>(
      `/api/v1/external/promos`,
      { params }
    );
    return data;
  }

  /**
   * Create a new promo
   */
  async createPromo(promoData: CreatePromoRequest): Promise<{ data: Promo }> {
    const { data } = await apiClient.post<{ data: Promo }>(
      '/api/v1/external/promos',
      promoData
    );
    return data;
  }

  /**
   * Update a promo
   */
  async updatePromo(id: string, promoData: UpdatePromoRequest): Promise<{ data: Promo }> {
    const { data } = await apiClient.put<{ data: Promo }>(
      `/api/v1/external/promos/${id}`,
      promoData
    );
    return data;
  }

  /**
   * Delete a promo
   */
  async deletePromo(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      `/api/v1/external/promos/${id}`
    );
    return data;
  }
}

export const promoService = new PromoService();
