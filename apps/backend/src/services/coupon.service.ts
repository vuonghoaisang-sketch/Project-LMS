import {
  findCouponByCode,
  findCouponById,
  incrementCouponUsage,
  listCoupons,
  createCoupon,
} from '../models/coupon.model';
import { Coupon } from '../types/order.types';
import AppError from '../utils/AppError';

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon;
  discount_amount: number;
  final_total: number;
  message: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    throw new AppError('Coupon code is required', 400);
  }

  const coupon = await findCouponByCode(code.trim());
  if (!coupon) {
    throw new AppError('Coupon code does not exist', 404);
  }

  if (!coupon.is_active) {
    throw new AppError('This coupon is currently inactive', 400);
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    throw new AppError('This coupon has expired', 400);
  }

  if (coupon.used_count >= coupon.usage_limit) {
    throw new AppError('This coupon has reached its maximum usage limit', 400);
  }

  if (subtotal < coupon.min_order_value) {
    throw new AppError(
      `Order subtotal must be at least $${coupon.min_order_value.toFixed(2)} to use this coupon`,
      400
    );
  }

  let discount = 0;
  if (coupon.discount_type === 'percent') {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount !== null && coupon.max_discount_amount > 0) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    // fixed
    discount = coupon.discount_value;
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  const finalTotal = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  return {
    valid: true,
    coupon,
    discount_amount: discount,
    final_total: finalTotal,
    message: `Coupon '${coupon.code}' applied! Saved $${discount.toFixed(2)}.`,
  };
}

export async function markCouponUsed(couponId: number) {
  await incrementCouponUsage(couponId);
}

export async function getAllCoupons() {
  return listCoupons();
}

export async function createNewCoupon(data: {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number | null;
  usage_limit?: number;
  expires_at?: string | null;
}) {
  const existing = await findCouponByCode(data.code);
  if (existing) {
    throw new AppError('A coupon with this code already exists', 409);
  }

  return createCoupon(data);
}
