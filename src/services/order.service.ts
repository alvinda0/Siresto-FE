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
}

export const orderService = new OrderService();
