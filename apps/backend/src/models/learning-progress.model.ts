import db from "../config/database";

interface LessonProgressRow {
  id: number;
  completed_at: Date | null;
}

export async function getCourseProgressRows(userId: number, courseId: number) {
  const [rows] = await db.execute(
    `
    SELECT lessons.id, lesson_progress.completed_at
    FROM lessons
    LEFT JOIN lesson_progress
      ON lesson_progress.lesson_id = lessons.id
      AND lesson_progress.user_id = ?
    WHERE lessons.course_id = ?
    ORDER BY lessons.position ASC, lessons.id ASC
    `,
    [userId, courseId],
  );

  return rows as LessonProgressRow[];
}

export async function markLessonAsCompleted(userId: number, lessonId: number) {
  await db.execute(
    `
    INSERT INTO lesson_progress (user_id, lesson_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE completed_at = completed_at
    `,
    [userId, lessonId],
  );
}
