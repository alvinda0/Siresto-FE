// services/product.service.ts

import { apiClient } from '@/lib/axios';
import {
  Product,
  ProductResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '@/types/product';

class ProductService {
  /**
   * Get all products
   */
  async getProducts(params?: { page?: number; limit?: number; branch_id?: string }): Promise<ProductResponse> {
    const { data } = await apiClient.get<ProductResponse>(
      '/api/v1/external/products',
      { params }
    );
    return data;
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<Product> {
    const { data } = await apiClient.get<{ data: Product }>(
      `/api/v1/external/products/${productId}`
    );
    return data.data;
  }

  /**
   * Create new product
   */
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const formData = new FormData();
    formData.append('branch_id', payload.branch_id);
    formData.append('category_id', payload.category_id);
    formData.append('image', payload.image);
    formData.append('name', payload.name);
    formData.append('description', payload.description);
    formData.append('stock', payload.stock.toString());
    formData.append('price', payload.price.toString());
    formData.append('position', payload.position);
    formData.append('is_available', payload.is_available.toString());

    // Debug log
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    // Use fetch instead of axios for file upload
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}/api/v1/external/products`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, payload: UpdateProductPayload): Promise<Product> {
    const formData = new FormData();
    
    if (payload.category_id) formData.append('category_id', payload.category_id);
    if (payload.image) formData.append('image', payload.image);
    if (payload.name) formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.stock !== undefined) formData.append('stock', payload.stock.toString());
    if (payload.price !== undefined) formData.append('price', payload.price.toString());
    if (payload.position) formData.append('position', payload.position);
    if (payload.is_available !== undefined) formData.append('is_available', payload.is_available.toString());

    // Use fetch instead of axios for file upload
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_END_URL}/api/v1/external/products/${productId}`,
      {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update product');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/api/v1/external/products/${productId}`);
  }
}

export const productService = new ProductService();
