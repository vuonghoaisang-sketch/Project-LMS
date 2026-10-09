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
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lesson = await createLessonService({
    ...req.body,
    course_id: courseId,
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    video_url: req.body.video_url.trim(),
    position: Number(req.body.position),
  });

  return res.status(201).json({
    success: true,
    message: "Create lesson successfully",
    lesson,
  });
}

export async function getLessonsController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lessons = await getLessonsService(courseId);

  return res.json({
    success: true,
    lessons,
  });
}

export async function getLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  const lesson = await getLessonService(id);

  return res.json({
    success: true,
    lesson,
  });
}

export async function updateLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await updateLessonService(id, {
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    video_url: req.body.video_url.trim(),
    position: Number(req.body.position),
  });

  return res.json({
    success: true,
    message: "Update lesson successfully",
  });
}

export async function deleteLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await deleteLessonService(id);

  return res.json({
    success: true,
    message: "Delete lesson successfully",
  });
}
