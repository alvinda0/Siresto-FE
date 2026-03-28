// services/category.service.ts

import { apiClient } from '@/lib/axios';
import { 
  CategoryResponse, 
  CreateCategoryRequest, 
  UpdateCategoryRequest,
  Category 
} from '@/types/category';

class CategoryService {
  /**
   * Get categories by branch and company
   */
  async getCategories(
    branchId: string, 
    companyId: string, 
    params?: { page?: number; limit?: number }
  ): Promise<CategoryResponse> {
    const { data } = await apiClient.get<CategoryResponse>(
      `/api/v1/external/categories`,
      {
        params: {
          branch_id: branchId,
          company_id: companyId,
          ...params,
        },
      }
    );
    return data;
  }

  /**
   * Create a new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<{ data: Category }> {
    const { data } = await apiClient.post<{ data: Category }>(
      '/api/v1/external/categories',
      categoryData
    );
    return data;
  }

  /**
   * Update a category
   */
  async updateCategory(id: string, categoryData: UpdateCategoryRequest): Promise<{ data: Category }> {
    const { data } = await apiClient.put<{ data: Category }>(
      `/api/v1/external/categories/${id}`,
      categoryData
    );
    return data;
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      `/api/v1/external/categories/${id}`
    );
    return data;
  }
}

export const categoryService = new CategoryService();
