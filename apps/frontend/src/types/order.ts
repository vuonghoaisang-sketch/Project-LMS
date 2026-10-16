export type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface OrderItem {
  id: number;
  order_id: number;
  course_id: number;
  price: number;
  course_title?: string;
  course_thumbnail?: string | null;
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
  coupon_code?: string | null;
}

export type PaymentMethod = 'mock' | 'vnpay' | 'momo' | 'vietqr' | 'sepay';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface CouponValidation {
  valid: boolean;
  message: string;
  discount_amount: number;
  final_total: number;
  coupon: {
    id: number;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
  };
}

export interface PaymentInitiateResult {
  paymentId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  checkoutUrl?: string;
  qrCodeData?: string;
  extra?: {
    transactionId?: string;
    orderCode?: string;
  };
}

export interface MockPayResult {
  success: boolean;
  alreadyProcessed?: boolean;
  transactionId?: string;
  message: string;
  order?: Order;
}

export interface CheckoutStatus {
  order: Order;
  payment: Payment | null;
}
