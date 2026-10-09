import { Request, Response } from "express";

import {
  completeLessonForUser,
  getCourseLearningProgress,
} from "../services/learning-progress.service";
import AppError from "../utils/AppError";

function getPositiveId(rawId: string | string[], fieldName: string) {
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Invalid ${fieldName}`, 400);
  }
  return id;
}

export async function getCourseProgressController(req: Request, res: Response) {
  const courseId = getPositiveId(req.params.courseId, "course id");
  const userId = (req as any).user.id as number;
  const progress = await getCourseLearningProgress(userId, courseId);

  return res.json({ success: true, progress });
}

export async function completeLessonController(req: Request, res: Response) {
  const lessonId = getPositiveId(req.params.id, "lesson id");
  const userId = (req as any).user.id as number;
  const completion = await completeLessonForUser(userId, lessonId);

  return res.json({ success: true, completion });
}
