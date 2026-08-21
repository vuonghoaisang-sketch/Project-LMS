import {
  createLesson,
  getLessonsByCourse,
  findLessonById,
  updateLesson,
  deleteLesson,
} from "../models/lesson.model";

import AppError from "../utils/AppError";

export async function createLessonService(data: any) {
  return await createLesson(data);
}

export async function getLessonsService(courseId: number) {
  return await getLessonsByCourse(courseId);
}

export async function getLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
}

export async function updateLessonService(id: number, data: any) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return await updateLesson(id, data);
}

export async function deleteLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await deleteLesson(id);

  return true;
}
