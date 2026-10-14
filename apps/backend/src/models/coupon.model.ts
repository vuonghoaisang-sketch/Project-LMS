import db from '../config/database';
import { Coupon } from '../types/order.types';

export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const [rows] = await db.execute(
    'SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) LIMIT 1',
    [code.trim()]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    ...row,
    discount_value: Number(row.discount_value),
    min_order_value: Number(row.min_order_value),
    max_discount_amount: row.max_discount_amount !== null ? Number(row.max_discount_amount) : null,
    is_active: Boolean(row.is_active),
  };
}

export async function findCouponById(id: number): Promise<Coupon | null> {
  const [rows] = await db.execute('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    ...row,
    discount_value: Number(row.discount_value),
    min_order_value: Number(row.min_order_value),
    max_discount_amount: row.max_discount_amount !== null ? Number(row.max_discount_amount) : null,
    is_active: Boolean(row.is_active),
  };
}

export async function incrementCouponUsage(id: number): Promise<void> {
  await db.execute('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [id]);
}

export async function listCoupons(): Promise<Coupon[]> {
  const [rows] = await db.execute('SELECT * FROM coupons ORDER BY created_at DESC');
  return (rows as any[]).map((row) => ({
    ...row,
    discount_value: Number(row.discount_value),
    min_order_value: Number(row.min_order_value),
    max_discount_amount: row.max_discount_amount !== null ? Number(row.max_discount_amount) : null,
    is_active: Boolean(row.is_active),
  }));
}

export async function createCoupon(data: {
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_discount_amount?: number | null;
  usage_limit?: number;
  expires_at?: string | null;
}): Promise<Coupon> {
  const [result] = await db.execute(
    `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code.trim().toUpperCase(),
      data.discount_type,
      data.discount_value,
      data.min_order_value ?? 0,
      data.max_discount_amount ?? null,
      data.usage_limit ?? 100,
      data.expires_at ?? null,
    ]
  );
  const id = (result as any).insertId;
  return (await findCouponById(id))!;
}
