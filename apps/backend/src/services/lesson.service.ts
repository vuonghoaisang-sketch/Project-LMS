import {
  createLesson,
  getLessonsByCourse,
  findLessonById,
  updateLesson,
  deleteLesson,
} from "../models/lesson.model";

export async function createLessonService(data: any) {
  return await createLesson(data);
}

export async function getLessonsService(courseId: number) {
  return await getLessonsByCourse(courseId);
}

export async function getLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return lesson;
}

export async function updateLessonService(id: number, data: any) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  return await updateLesson(id, data);
}

export async function deleteLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await deleteLesson(id);

  return true;
}
