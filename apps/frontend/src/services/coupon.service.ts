import api from '@/lib/axios';
import { CouponValidation } from '@/types/order';

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidation> {
  const response = await api.post('/coupons/validate', { code, subtotal });
  return response.data;
}
