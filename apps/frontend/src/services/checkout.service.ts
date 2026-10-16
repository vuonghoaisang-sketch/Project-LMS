import api from '@/lib/axios';
import {
  CheckoutStatus,
  MockPayResult,
  PaymentInitiateResult,
  PaymentMethod,
} from '@/types/order';

export async function initiateCheckout(
  orderId: number,
  paymentMethod: PaymentMethod = 'mock',
): Promise<PaymentInitiateResult> {
  const response = await api.post('/checkout/initiate', {
    order_id: orderId,
    payment_method: paymentMethod,
  });
  return response.data;
}

export async function mockPay(
  orderId: number,
  shouldSucceed: boolean,
): Promise<MockPayResult> {
  const response = await api.post('/checkout/mock-pay', {
    order_id: orderId,
    should_succeed: shouldSucceed,
  });
  return response.data;
}

export async function getCheckoutStatus(
  orderId: number,
): Promise<CheckoutStatus> {
  const response = await api.get(`/checkout/status/${orderId}`);
  return response.data;
}
