import db from "../config/database";

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  reference_id: number | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

export async function createNotification(data: {
  user_id: number;
  type: string;
  message: string;
  reference_id?: number;
  reference_type?: string;
}): Promise<void> {
  await db.execute(
    "INSERT INTO notifications (user_id, type, message, reference_id, reference_type) VALUES (?, ?, ?, ?, ?)",
    [
      data.user_id,
      data.type,
      data.message,
      data.reference_id ?? null,
      data.reference_type ?? null,
    ],
  );
}

export async function getNotificationsForUser(
  userId: number,
  limit = 30,
): Promise<Notification[]> {
  const [rows] = await db.query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, limit],
  );
  return (rows as any[]).map((r) => ({ ...r, is_read: Boolean(r.is_read) }));
}

export async function markNotificationsRead(userId: number): Promise<void> {
  await db.execute(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId],
  );
}

export async function getUnreadCount(userId: number): Promise<number> {
  const [rows] = await db.execute(
    "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId],
  );
  return Number((rows as any[])[0]?.count || 0);
}
