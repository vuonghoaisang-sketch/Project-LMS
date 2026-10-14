import db from '../config/database';
import { Order, OrderItem, OrderStatus } from '../types/order.types';

export async function findOrderById(id: number): Promise<Order | null> {
  const [rows] = await db.execute(
    `SELECT o.*, u.name as user_name, u.email as user_email, c.code as coupon_code
     FROM orders o
     JOIN users u ON o.user_id = u.id
     LEFT JOIN coupons c ON o.coupon_id = c.id
     WHERE o.id = ?
     LIMIT 1`,
    [id]
  );
  const row = (rows as any[])[0];
  if (!row) return null;

  const [itemRows] = await db.execute(
    `SELECT oi.*, co.title as course_title, co.thumbnail as course_thumbnail
     FROM order_items oi
     JOIN courses co ON oi.course_id = co.id
     WHERE oi.order_id = ?`,
    [id]
  );

  return {
    ...row,
    subtotal: Number(row.subtotal),
    discount_amount: Number(row.discount_amount),
    total_amount: Number(row.total_amount),
    items: (itemRows as any[]).map((item) => ({
      ...item,
      price: Number(item.price),
    })),
  };
}

export async function findOrderByCode(orderCode: string): Promise<Order | null> {
  const [rows] = await db.execute(
    `SELECT id FROM orders WHERE order_code = ? LIMIT 1`,
    [orderCode]
  );
  const row = (rows as any[])[0];
  if (!row) return null;
  return findOrderById(row.id);
}

export async function createOrder(data: {
  order_code: string;
  user_id: number;
  subtotal: number;
  discount_amount: number;
  coupon_id: number | null;
  total_amount: number;
  status: OrderStatus;
  items: Array<{ course_id: number; price: number }>;
}): Promise<Order> {
  const [result] = await db.execute(
    `INSERT INTO orders (order_code, user_id, subtotal, discount_amount, coupon_id, total_amount, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.order_code,
      data.user_id,
      data.subtotal,
      data.discount_amount,
      data.coupon_id ?? null,
      data.total_amount,
      data.status,
    ]
  );

  const orderId = (result as any).insertId;

  for (const item of data.items) {
    await db.execute(
      `INSERT INTO order_items (order_id, course_id, price) VALUES (?, ?, ?)`,
      [orderId, item.course_id, item.price]
    );
  }

  return (await findOrderById(orderId))!;
}

export async function getUserOrders(userId: number): Promise<Order[]> {
  const [rows] = await db.execute(
    `SELECT o.*, c.code as coupon_code
     FROM orders o
     LEFT JOIN coupons c ON o.coupon_id = c.id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`,
    [userId]
  );

  const orders: Order[] = [];
  for (const row of rows as any[]) {
    const [itemRows] = await db.execute(
      `SELECT oi.*, co.title as course_title, co.thumbnail as course_thumbnail
       FROM order_items oi
       JOIN courses co ON oi.course_id = co.id
       WHERE oi.order_id = ?`,
      [row.id]
    );

    orders.push({
      ...row,
      subtotal: Number(row.subtotal),
      discount_amount: Number(row.discount_amount),
      total_amount: Number(row.total_amount),
      items: (itemRows as any[]).map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    });
  }

  return orders;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
  await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
}
