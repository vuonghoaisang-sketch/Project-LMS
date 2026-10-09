import { Request, Response } from "express";

import {
  enrollUser,
  getUserEnrollments,
  isUserEnrolled,
  getCourseEnrollmentCount,
} from "../services/enrollment.service";

export async function enrollCourseController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const courseId = Number(req.body.course_id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course_id",
    });
  }

  const result = await enrollUser(userId, courseId);

  return res.status(201).json({
    success: true,
    message: "Enroll course successfully",
    enrollment: result,
  });
}

export async function getMyEnrollmentsController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const enrollments = await getUserEnrollments(userId);

  return res.json(enrollments);
}

export async function checkEnrollmentController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const enrolled = await isUserEnrolled(userId, courseId);

  return res.json({
    success: true,
    enrolled,
  });
}

export async function getCourseEnrollmentCountController(
  req: Request,
  res: Response,
) {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const count = await getCourseEnrollmentCount(courseId);

  return res.json({
    success: true,
    count,
  });
}
