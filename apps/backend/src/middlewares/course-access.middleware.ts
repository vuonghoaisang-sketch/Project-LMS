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
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }

    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const enrollment = await findEnrollment(user.id, courseId);

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
