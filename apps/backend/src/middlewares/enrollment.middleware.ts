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
        message: "Unauthorized",
      });
    }

    // Admin và Instructor được xem lesson
    // mà không cần enrollment.
    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }

    const lessonId = Number(req.params.id);

    if (!lessonId) {
      return res.status(400).json({
        message: "Invalid lesson id",
      });
    }

    const lesson = await getLessonService(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const enrollment = await findEnrollment(user.id, lesson.course_id);

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in this course first",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Enrollment check failed",
    });
  }
}
