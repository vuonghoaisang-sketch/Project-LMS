import {
  createLesson,
  getLessonsByCourse,
  findLessonById,
  updateLesson,
  deleteLesson,
} from "../models/lesson.model";
import {
  createAttachment,
  deleteAttachment,
  findAttachmentById,
  getAttachmentsByLessonId,
} from "../models/attachment.model";
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

export async function addLessonAttachmentService(
  lessonId: number,
  data: {
    name: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  },
) {
  const lesson = await findLessonById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return await createAttachment({
    lessonId,
    name: data.name,
    fileUrl: data.fileUrl,
    fileSize: data.fileSize,
    fileType: data.fileType,
  });
}

export async function deleteLessonAttachmentService(attachmentId: number) {
  const attachment = await findAttachmentById(attachmentId);
  if (!attachment) {
    throw new AppError("Attachment not found", 404);
  }

  await deleteAttachment(attachmentId);
  return true;
}

export async function getLessonAttachmentsService(lessonId: number) {
  const lesson = await findLessonById(lessonId);
  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return await getAttachmentsByLessonId(lessonId);
}
