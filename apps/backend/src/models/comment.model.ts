import db from "../config/database";

export interface Comment {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string | null;
  replies?: Comment[];
}

export async function getCommentsByLesson(
  lessonId: number,
): Promise<Comment[]> {
  const [rows] = await db.execute(
    `SELECT c.*, u.name as user_name, u.avatar as user_avatar
     FROM lesson_comments c
     JOIN users u ON c.user_id = u.id
     WHERE c.lesson_id = ? AND c.parent_id IS NULL AND c.is_deleted = 0
     ORDER BY c.created_at ASC`,
    [lessonId],
  );
  const topLevel = rows as Comment[];
  for (const comment of topLevel) {
    const [replyRows] = await db.execute(
      `SELECT c.*, u.name as user_name, u.avatar as user_avatar
       FROM lesson_comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.parent_id = ? AND c.is_deleted = 0
       ORDER BY c.created_at ASC`,
      [comment.id],
    );
    comment.replies = replyRows as Comment[];
  }
  return topLevel;
}

export async function findCommentById(id: number): Promise<Comment | null> {
  const [rows] = await db.execute("SELECT * FROM lesson_comments WHERE id = ?", [
    id,
  ]);
  return (rows as Comment[])[0] ?? null;
}

export async function createComment(data: {
  lesson_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
}): Promise<Comment> {
  const [result] = await db.execute(
    "INSERT INTO lesson_comments (lesson_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)",
    [data.lesson_id, data.user_id, data.parent_id ?? null, data.content],
  );
  const id = (result as any).insertId;
  const [rows] = await db.execute(
    `SELECT c.*, u.name as user_name, u.avatar as user_avatar FROM lesson_comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
    [id],
  );
  return (rows as Comment[])[0];
}

export async function softDeleteComment(id: number): Promise<void> {
  await db.execute(
    "UPDATE lesson_comments SET is_deleted = 1, content = ? WHERE id = ?",
    ["[This comment was deleted]", id],
  );
}

export async function getParentCommentInfo(
  parentId: number,
): Promise<{ user_id: number; lesson_id: number } | null> {
  const [rows] = await db.execute(
    "SELECT user_id, lesson_id FROM lesson_comments WHERE id = ?",
    [parentId],
  );
  const results = rows as any[];
  return results[0] ?? null;
}
