import { Request, Response, NextFunction } from "express";
import { findEnrollment } from "../models/enrollment.model";

export async function requireCourseEnrollment(
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
    // Admin và Instructor được xem course của hệ thống.
    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return res.status(400).json({
        message: "Invalid course id",
      });
    }
    const enrollment = await findEnrollment(user.id, courseId);
    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in this course first",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Course access check failed",
    });
  }
}
