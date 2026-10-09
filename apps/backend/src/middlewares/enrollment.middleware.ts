import { Request, Response, NextFunction } from "express";

import { findEnrollment } from "../models/enrollment.model";
import { getLessonService } from "../services/lesson.service";

export async function requireLessonEnrollment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }

    const lessonId = Number(req.params.id);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }

    const lesson = await getLessonService(lessonId);

    const enrollment = await findEnrollment(user.id, lesson.course_id);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course first",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
