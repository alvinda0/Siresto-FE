// services/order.service.ts

import { apiClient } from '@/lib/axios';
import { CreateOrderPayload, Order, OrderResponse, OrderListResponse } from '@/types/order';

class OrderService {
  /**
   * Create new order
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.post<OrderResponse>(
      '/api/v1/external/orders',
      payload
    );
    return data.data;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const { data } = await apiClient.get<OrderResponse>(
      `/api/v1/external/orders/${orderId}`
    );
    return data.data;
  }

  /**
   * Get all orders
   */
  async getOrders(params?: { 
    page?: number; 
    limit?: number;
    status?: string;
    method?: string;
    customer?: string;
    order_id?: string;
  }): Promise<OrderListResponse> {
    const { data } = await apiClient.get<OrderListResponse>(
      '/api/v1/external/orders',
      { params }
    );
    return data;
  }

  /**
   * Update order
   */
  async updateOrder(orderId: string, payload: CreateOrderPayload): Promise<Order> {
    const { data } = await apiClient.put<OrderResponse>(
      `/api/v1/external/orders/${orderId}`,
      payload
    );
    return data.data;
  }

  /**
   * Delete order
   */
  async deleteOrder(orderId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      `/api/v1/external/orders/${orderId}`
    );
    return data;
  }

  /**
   * Quick add item to existing order
   */
  async quickAddItem(orderId: string, payload: {
    product_id: string;
    quantity: number;
    note?: string;
  }): Promise<Order> {
    const { data } = await apiClient.post<OrderResponse>(
      `/api/v1/external/orders/quick/${orderId}`,
      payload
    );
    return data.data;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data } = await apiClient.patch<OrderResponse>(
      `/api/v1/external/orders/${orderId}/status`,
      { status }
    );
    return data.data;
  }

  /**
   * Process order payment
   */
  async processPayment(orderId: string, payload: {
    payment_method: string;
    paid_amount: number;
    promo_code?: string;
    payment_note?: string;
  }): Promise<Order> {
    const { data } = await apiClient.post<OrderResponse>(
      `/api/v1/external/orders/${orderId}/payment`,
      payload
    );
    return data.data;
  }
}

export const orderService = new OrderService();
