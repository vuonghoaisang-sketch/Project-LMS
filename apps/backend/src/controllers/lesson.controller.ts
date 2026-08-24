import { Request, Response } from "express";

import {
  createLessonService,
  getLessonsService,
  getLessonService,
  updateLessonService,
  deleteLessonService,
} from "../services/lesson.service";

import { validateLessonInput } from "../validators/lesson.validator";

export async function createLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

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
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors,
    });
  }

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
