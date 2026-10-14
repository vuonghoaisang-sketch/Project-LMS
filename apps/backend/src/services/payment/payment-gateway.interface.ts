import { Order, PaymentMethod } from '../../types/order.types';

export interface PaymentInitiateResult {
  paymentId: number;
  paymentMethod: PaymentMethod;
  amount: number;
  checkoutUrl?: string;
  qrCodeData?: string;
  extra?: Record<string, any>;
}

export interface IPaymentGateway {
  name: PaymentMethod;
  initiate(order: Order, userId: number, metadata?: any): Promise<PaymentInitiateResult>;
  process(order: Order, paymentId: number, options?: any): Promise<{
    success: boolean;
    transactionId: string;
    message: string;
  }>;
}
