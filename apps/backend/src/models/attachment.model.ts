import db from "../config/database";

export interface LessonAttachment {
  id: number;
  lesson_id: number;
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string | Date;
}

export async function getAttachmentsByLessonId(
  lessonId: number,
): Promise<LessonAttachment[]> {
  const [rows] = await db.execute(
    `
    SELECT id, lesson_id, name, file_url, file_size, file_type, created_at
    FROM lesson_attachments
    WHERE lesson_id = ?
    ORDER BY id ASC
    `,
    [lessonId],
  );

  return rows as LessonAttachment[];
}

export async function findAttachmentById(
  id: number,
): Promise<LessonAttachment | null> {
  const [rows] = await db.execute(
    `
    SELECT id, lesson_id, name, file_url, file_size, file_type, created_at
    FROM lesson_attachments
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  const results = rows as LessonAttachment[];
  return results[0] ?? null;
}

export async function createAttachment(data: {
  lessonId: number;
  name: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}): Promise<LessonAttachment> {
  const [result] = await db.execute(
    `
    INSERT INTO lesson_attachments (lesson_id, name, file_url, file_size, file_type)
    VALUES (?, ?, ?, ?, ?)
    `,
    [data.lessonId, data.name, data.fileUrl, data.fileSize, data.fileType],
  );

  const insertId = (result as any).insertId;
  const created = await findAttachmentById(insertId);
  return created!;
}

export async function deleteAttachment(id: number) {
  const [result] = await db.execute(
    `
    DELETE FROM lesson_attachments
    WHERE id = ?
    `,
    [id],
  );

  return result;
}
