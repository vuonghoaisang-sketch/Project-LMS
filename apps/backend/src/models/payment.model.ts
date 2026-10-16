import db from "../config/database";
import { Payment, PaymentMethod, PaymentStatus } from "../types/order.types";

export async function findPaymentById(id: number): Promise<Payment | null> {
  const [rows] = await db.execute(
    "SELECT * FROM payments WHERE id = ? LIMIT 1",
    [id],
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return {
    ...row,
    amount: Number(row.amount),
  };
}

export async function findPaymentsByOrderId(
  orderId: number,
): Promise<Payment[]> {
  const [rows] = await db.execute(
    "SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC, id DESC",
    [orderId],
  );
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
      data.status ?? "pending",
      data.metadata ? JSON.stringify(data.metadata) : null,
    ],
  );
  const id = (result as any).insertId;
  return (await findPaymentById(id))!;
}

export async function updatePaymentStatus(
  id: number,
  status: PaymentStatus,
  transactionId?: string,
  metadata?: any,
): Promise<void> {
  const paidAt = status === "completed" ? new Date() : null;
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
    ],
  );
}

export type SettleOutcome =
  | "not_found"
  | "amount_mismatch"
  | "already_processed"
  | "completed"
  | "failed";

export interface SettleResult {
  outcome: SettleOutcome;
  orderId: number; // 0 nếu not_found
  newlyCompleted?: boolean; // true nếu LẦN NÀY mới chuyển đơn sang completed
}

/**
 * Chốt kết quả thanh toán trong 1 transaction.
 * - Khoá dòng payment (FOR UPDATE) nên 2 webhook đến cùng lúc cũng chỉ 1 cái thắng
 * - Payment không còn 'pending' => bỏ qua (idempotent)
 * - Thành công: payment=completed, order=completed, tăng used_count coupon
 * - Thất bại: chỉ payment=failed, order GIỮ pending để user thử lại
 */
export async function settlePaymentTx(input: {
  paymentId: number;
  status: "completed" | "failed";
  transactionId: string;
  paidAmount: number;
  metadata?: any;
}): Promise<SettleResult> {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [payRows] = await conn.execute(
      "SELECT * FROM payments WHERE id = ? LIMIT 1 FOR UPDATE",
      [input.paymentId],
    );
    const payment = (payRows as any[])[0];

    if (!payment) {
      await conn.rollback();
      return { outcome: "not_found", orderId: 0 };
    }

    if (payment.status !== "pending") {
      await conn.rollback();
      return { outcome: "already_processed", orderId: payment.order_id };
    }

    if (
      input.status === "completed" &&
      Number(payment.amount) !== input.paidAmount
    ) {
      await conn.rollback();
      return { outcome: "amount_mismatch", orderId: payment.order_id };
    }

    const metadataJson = input.metadata ? JSON.stringify(input.metadata) : null;

    if (input.status === "failed") {
      await conn.execute(
        `UPDATE payments
         SET status = 'failed',
             transaction_id = COALESCE(?, transaction_id),
             metadata = COALESCE(?, metadata)
         WHERE id = ?`,
        [input.transactionId, metadataJson, input.paymentId],
      );
      await conn.commit();
      return { outcome: "failed", orderId: payment.order_id };
    }

    // Thành công
    await conn.execute(
      `UPDATE payments
       SET status = 'completed',
           transaction_id = COALESCE(?, transaction_id),
           paid_at = NOW(),
           metadata = COALESCE(?, metadata)
       WHERE id = ?`,
      [input.transactionId, metadataJson, input.paymentId],
    );

    const [orderRows] = await conn.execute(
      "SELECT id, status, coupon_id FROM orders WHERE id = ? LIMIT 1 FOR UPDATE",
      [payment.order_id],
    );
    const order = (orderRows as any[])[0];

    let newlyCompleted = false;
    if (order && order.status !== "completed") {
      await conn.execute(
        `UPDATE orders SET status = 'completed' WHERE id = ?`,
        [order.id],
      );
      if (order.coupon_id) {
        await conn.execute(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [order.coupon_id],
        );
      }
      newlyCompleted = true;
    }

    await conn.commit();
    return { outcome: "completed", orderId: payment.order_id, newlyCompleted };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
