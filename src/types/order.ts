// types/order.ts

export type OrderMethod = 'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY';

export interface OrderItem {
  product_id: string;
  quantity: number;
  note?: string;
}

export interface TaxDetail {
  tax_id: string;
  tax_name: string;
  percentage: number;
  priority: number;
  base_amount: number;
  tax_amount: number;
}

export interface PromoDetail {
  promo_id: string;
  promo_name: string;
  promo_code: string;
  promo_type: 'percentage' | 'fixed';
  promo_value: number;
  discount_amount: number;
  max_discount: number | null;
  min_transaction: number;
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
  promo_id?: string;
  discount_amount?: number;
  promo_details?: PromoDetail;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  paid_amount?: number;
  change_amount?: number;
  payment_note?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItemDetail[];
  tax_details?: TaxDetail[];
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
