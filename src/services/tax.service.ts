// services/tax.service.ts

import { apiClient } from '@/lib/axios';
import { 
  TaxResponse, 
  CreateTaxRequest, 
  UpdateTaxRequest,
  Tax 
} from '@/types/tax';

class TaxService {
  /**
   * Get taxes with pagination
   */
  async getTaxes(params?: { page?: number; limit?: number }): Promise<TaxResponse> {
    const { data } = await apiClient.get<TaxResponse>(
      `/api/v1/external/tax`,
      { params }
    );
    return data;
  }

  /**
   * Create a new tax
   */
  async createTax(taxData: CreateTaxRequest): Promise<{ data: Tax }> {
    const { data } = await apiClient.post<{ data: Tax }>(
      '/api/v1/external/tax',
      taxData
    );
    return data;
  }

  /**
   * Update a tax
   */
  async updateTax(id: string, taxData: UpdateTaxRequest): Promise<{ data: Tax }> {
    const { data } = await apiClient.put<{ data: Tax }>(
      `/api/v1/external/tax/${id}`,
      taxData
    );
    return data;
  }

  /**
   * Delete a tax
   */
  async deleteTax(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      `/api/v1/external/tax/${id}`
    );
    return data;
  }
}

export const taxService = new TaxService();
