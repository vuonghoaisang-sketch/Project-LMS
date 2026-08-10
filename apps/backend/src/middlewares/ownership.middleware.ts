import { Request, Response, NextFunction } from "express";
import { findCourseById, findCourseOwnerById } from "../models/course.model";
import { findLessonById } from "../models/lesson.model";

export async function requireCourseOwner(
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

    // Admin được phép quản lý tất cả course
    if (user.role === "admin") {
      return next();
    }

    const courseId = Number(req.params.id || req.params.courseId);

    if (!courseId || Number.isNaN(courseId)) {
      return res.status(400).json({
        message: "Invalid course id",
      });
    }

    const course = await findCourseOwnerById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.created_by !== user.id) {
      return res.status(403).json({
        message: "You can only manage your own courses",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Ownership check failed",
    });
  }
}

export async function requireLessonOwner(
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

    // Admin được phép quản lý tất cả lesson
    if (user.role === "admin") {
      return next();
    }

    const lessonId = Number(req.params.id);

    if (!lessonId || Number.isNaN(lessonId)) {
      return res.status(400).json({
        message: "Invalid lesson id",
      });
    }

    const lesson = await findLessonById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const course = await findCourseById(lesson.course_id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.created_by !== user.id) {
      return res.status(403).json({
        message: "You can only manage lessons of your own courses",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Ownership check failed",
    });
  }
}
