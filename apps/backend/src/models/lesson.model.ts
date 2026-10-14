import db from "../config/database";
import { getAttachmentsByLessonId, LessonAttachment } from "./attachment.model";

export interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  description?: string | null;
  video_type?: "embed" | "upload";
  video_url?: string | null;
  position?: number;
  attachments?: LessonAttachment[];
}

export async function createLesson(lesson: Lesson) {
  const [result] = await db.execute(
    `
    INSERT INTO lessons
    (
      course_id,
      title,
      description,
      video_type,
      video_url,
      position
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      lesson.course_id,
      lesson.title,
      lesson.description ?? null,
      lesson.video_type ?? "embed",
      lesson.video_url ?? null,
      lesson.position ?? 1,
    ],
  );

  return result;
}

export async function getLessonsByCourse(courseId: number) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM lessons
    WHERE course_id = ?
    ORDER BY position ASC
    `,
    [courseId],
  );
  return rows;
}

export async function findLessonById(id: number): Promise<Lesson | null> {
  const [rows] = await db.query(
    `
    SELECT *
    FROM lessons
    WHERE id = ?
    `,
    [id],
  );
  const lessons = rows as Lesson[];
  if (!lessons[0]) return null;

  const lesson = lessons[0];
  const attachments = await getAttachmentsByLessonId(id);
  lesson.attachments = attachments;

  return lesson;
}

export async function updateLesson(id: number, lesson: Lesson) {
  const [result] = await db.execute(
    `
    UPDATE lessons
    SET
      title = ?,
      description = ?,
      video_type = ?,
      video_url = ?,
      position = ?
    WHERE id = ?
    `,
    [
      lesson.title,
      lesson.description ?? null,
      lesson.video_type ?? "embed",
      lesson.video_url ?? null,
      lesson.position ?? 1,
      id,
    ],
  );

  return result;
}

export async function deleteLesson(id: number) {
  const [result] = await db.execute(
    `
    DELETE FROM lessons
    WHERE id = ?
    `,
    [id],
  );

  return result;
}
