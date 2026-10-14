export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  usage_limit: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  course_id: number;
  price: number;
  course_title?: string;
  course_thumbnail?: string | null;
  created_at?: string;
}

export interface Order {
  id: number;
  order_code: string;
  user_id: number;
  subtotal: number;
  discount_amount: number;
  coupon_id: number | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  user_name?: string;
  user_email?: string;
  coupon_code?: string | null;
}

export type PaymentMethod = 'mock' | 'vnpay' | 'momo' | 'vietqr' | 'sepay';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: number;
  order_id: number;
  user_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  status: PaymentStatus;
  metadata: string | null;
  paid_at: string | null;
  created_at: string;
}
