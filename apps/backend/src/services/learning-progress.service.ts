import { getCourseProgressRows, markLessonAsCompleted } from "../models/learning-progress.model";
import { findLessonById } from "../models/lesson.model";
import AppError from "../utils/AppError";

export async function getCourseLearningProgress(userId: number, courseId: number) {
  const rows = await getCourseProgressRows(userId, courseId);
  const completedLessonIds = rows
    .filter((row) => row.completed_at !== null)
    .map((row) => row.id);
  const totalLessons = rows.length;

  return {
    completedLessonIds,
    completedLessons: completedLessonIds.length,
    totalLessons,
    progressPercent: totalLessons
      ? Math.round((completedLessonIds.length / totalLessons) * 100)
      : 0,
  };
}

export async function completeLessonForUser(userId: number, lessonId: number) {
  const lesson = await findLessonById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await markLessonAsCompleted(userId, lessonId);
  return { lessonId, completed: true };
}
