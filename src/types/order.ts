// types/order.ts

export type OrderMethod = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

export interface OrderItem {
  product_id: string;
  quantity: number;
  note?: string;
}

export interface CreateOrderPayload {
  customer_name?: string;
  customer_phone?: string;
  table_number: string;
  notes?: string;
  referral_code?: string;
  order_method: OrderMethod;
  promo_code?: string;
  order_items: OrderItem[];
}

export interface Order {
  id: string;
  company_id: string;
  branch_id: string;
  customer_name?: string;
  customer_phone?: string;
  table_number: string;
  notes?: string;
  referral_code?: string;
  order_method: OrderMethod;
  promo_code?: string;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItemDetail[];
}

export interface OrderItemDetail {
  id: string;
  order_id?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  price: number;
  subtotal?: number;
  note?: string;
  product?: {
    id: string;
    name: string;
    image: string;
  };
}

export interface OrderResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Order;
}

export interface OrderListResponse {
  success: boolean;
  message: string;
  status: number;
  timestamp: string;
  data: Order[];
  meta?: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
}

export interface WebSocketOrderMessage {
  type: 'order';
  action: 'created' | 'updated' | 'deleted';
  data: Order;
  company_id: string;
  branch_id: string;
}
