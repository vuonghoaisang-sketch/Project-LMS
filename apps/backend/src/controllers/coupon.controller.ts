import { Request, Response } from 'express';
import { validateCoupon, getAllCoupons, createNewCoupon } from '../services/coupon.service';

export async function validateCouponController(req: Request, res: Response) {
  const { code, subtotal } = req.body;
  const result = await validateCoupon(String(code), Number(subtotal) || 0);
  return res.json({ success: true, ...result });
}

export async function listCouponsController(_req: Request, res: Response) {
  const coupons = await getAllCoupons();
  return res.json({ success: true, coupons });
}

export async function createCouponController(req: Request, res: Response) {
  const {
    code,
    discount_type,
    discount_value,
    min_order_value,
    max_discount_amount,
    usage_limit,
    expires_at,
  } = req.body;

  if (!code || !discount_value) {
    return res.status(400).json({ success: false, message: 'Code and discount_value are required' });
  }

  const coupon = await createNewCoupon({
    code: String(code),
    discount_type: discount_type === 'fixed' ? 'fixed' : 'percent',
    discount_value: Number(discount_value),
    min_order_value: min_order_value ? Number(min_order_value) : 0,
    max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
    usage_limit: usage_limit ? Number(usage_limit) : 100,
    expires_at: expires_at || null,
  });

  return res.status(201).json({ success: true, coupon });
}
