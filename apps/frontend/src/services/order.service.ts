import api from '@/lib/axios';
import { Order } from '@/types/order';

export async function createOrder(
  courseId: number,
  couponCode?: string,
): Promise<Order> {
  const response = await api.post('/orders', {
    course_id: courseId,
    coupon_code: couponCode || undefined,
  });
  return response.data.order;
}

export async function getMyOrders(): Promise<Order[]> {
  const response = await api.get('/orders');
  return response.data.orders;
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await api.get(`/orders/${id}`);
  return response.data.order;
}

export async function cancelOrder(id: number) {
  const response = await api.post(`/orders/${id}/cancel`);
  return response.data;
}
