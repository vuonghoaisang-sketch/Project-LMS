import { Request, Response } from "express";

import {
  createLessonService,
  getLessonsService,
  getLessonService,
  updateLessonService,
  deleteLessonService,
} from "../services/lesson.service";

export async function createLessonController(req: Request, res: Response) {
  try {
    const courseId = Number(req.params.courseId);

    const lesson = await createLessonService({
      course_id: courseId,

      ...req.body,
    });

    return res.status(201).json({
      message: "Create lesson successfully",

      lesson,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Create lesson failed",
    });
  }
}

export async function getLessonsController(req: Request, res: Response) {
  try {
    const courseId = Number(req.params.courseId);

    const lessons = await getLessonsService(courseId);

    return res.json(lessons);
  } catch (error) {
    return res.status(500).json({
      message: "Get lessons failed",
    });
  }
}

export async function getLessonController(req: Request, res: Response) {
  try {
    const lesson = await getLessonService(Number(req.params.id));

    return res.json(lesson);
  } catch (error) {
    return res.status(404).json({
      message: "Lesson not found",
    });
  }
}

export async function updateLessonController(req: Request, res: Response) {
  try {
    await updateLessonService(
      Number(req.params.id),

      req.body,
    );

    return res.json({
      message: "Update lesson successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Update failed",
    });
  }
}

export async function deleteLessonController(req: Request, res: Response) {
  try {
    await deleteLessonService(Number(req.params.id));

    return res.json({
      message: "Delete lesson successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Delete failed",
    });
  }
}
