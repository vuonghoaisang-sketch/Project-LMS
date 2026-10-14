import db from '../config/database';
import { Payment, PaymentMethod, PaymentStatus } from '../types/order.types';

export async function findPaymentById(id: number): Promise<Payment | null> {
  const [rows] = await db.execute('SELECT * FROM payments WHERE id = ? LIMIT 1', [id]);
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    ...row,
    amount: Number(row.amount),
  };
}

export async function findPaymentsByOrderId(orderId: number): Promise<Payment[]> {
  const [rows] = await db.execute('SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC', [orderId]);
  return (rows as any[]).map((r) => ({
    ...r,
    amount: Number(r.amount),
  }));
}

export async function createPaymentRecord(data: {
  order_id: number;
  user_id: number;
  amount: number;
  payment_method: PaymentMethod;
  transaction_id?: string | null;
  status?: PaymentStatus;
  metadata?: any;
}): Promise<Payment> {
  const [result] = await db.execute(
    `INSERT INTO payments (order_id, user_id, amount, payment_method, transaction_id, status, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.order_id,
      data.user_id,
      data.amount,
      data.payment_method,
      data.transaction_id ?? null,
      data.status ?? 'pending',
      data.metadata ? JSON.stringify(data.metadata) : null,
    ]
  );
  const id = (result as any).insertId;
  return (await findPaymentById(id))!;
}

export async function updatePaymentStatus(
  id: number,
  status: PaymentStatus,
  transactionId?: string,
  metadata?: any
): Promise<void> {
  const paidAt = status === 'completed' ? new Date() : null;
  await db.execute(
    `UPDATE payments
     SET status = ?, transaction_id = COALESCE(?, transaction_id),
         paid_at = COALESCE(?, paid_at),
         metadata = COALESCE(?, metadata)
     WHERE id = ?`,
    [
      status,
      transactionId ?? null,
      paidAt,
      metadata ? JSON.stringify(metadata) : null,
      id,
    ]
  );
}
