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
  promo_category: string;
  type: 'percentage' | 'fixed';
  value: number;
  max_discount: number | null;
  min_transaction?: number;
  quota?: number;
  used_count?: number;
  remaining_quota?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_expired: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  // For product promo
  product_ids?: string[];
  // For bundle promo
  bundle_items?: Array<{
    product_id: string;
    quantity: number;
  }>;
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
  promo_category: 'normal' | 'product' | 'bundle';
  type: 'percentage' | 'fixed';
  value: number;
  max_discount?: number | null;
  min_transaction?: number;
  quota?: number;
  start_date: string;
  end_date: string;
  branch_id?: string | null;
  is_active: boolean;
  // For product promo
  product_ids?: string[];
  // For bundle promo
  bundle_items?: Array<{
    product_id: string;
    quantity: number;
  }>;
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
   * Get a single promo by ID
   */
  async getPromoById(id: string): Promise<{ data: Promo }> {
    const { data } = await apiClient.get<{ data: Promo }>(
      `/api/v1/external/promos/${id}`
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

  /**
   * Validate a promo code
   */
  async validatePromo(code: string): Promise<{
    valid: boolean;
    message: string;
    promo: Promo | null;
  }> {
    const { data } = await apiClient.get<{
      success: boolean;
      message: string;
      data: {
        valid: boolean;
        message: string;
        promo: Promo;
      };
    }>(`/api/v1/external/promos/validate/${code}`);
    return data.data;
  }
}

export const promoService = new PromoService();
