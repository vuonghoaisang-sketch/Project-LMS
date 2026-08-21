import { Request, Response } from "express";

import {
  createLessonService,
  getLessonsService,
  getLessonService,
  updateLessonService,
  deleteLessonService,
} from "../services/lesson.service";

export async function createLessonController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);

  const lesson = await createLessonService({
    course_id: courseId,
    ...req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Create lesson successfully",
    lesson,
  });
}

export async function getLessonsController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);

  const lessons = await getLessonsService(courseId);

  return res.json({
    success: true,
    lessons,
  });
}

export async function getLessonController(req: Request, res: Response) {
  const lesson = await getLessonService(Number(req.params.id));

  return res.json({
    success: true,
    lesson,
  });
}

export async function updateLessonController(req: Request, res: Response) {
  await updateLessonService(Number(req.params.id), req.body);

  return res.json({
    success: true,
    message: "Update lesson successfully",
  });
}

export async function deleteLessonController(req: Request, res: Response) {
  await deleteLessonService(Number(req.params.id));

  return res.json({
    success: true,
    message: "Delete lesson successfully",
  });
}
