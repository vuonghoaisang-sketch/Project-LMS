import { Request, Response } from "express";

import {
  enrollUser,
  getUserEnrollments,
  isUserEnrolled,
  getCourseEnrollmentCount,
} from "../services/enrollment.service";

export async function enrollCourseController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const courseId = Number(req.body.course_id);

    if (!courseId) {
      return res.status(400).json({
        message: "course_id is required",
      });
    }

    const result = await enrollUser(userId, courseId);

    return res.status(201).json({
      message: "Enroll course successfully",
      enrollment: result,
    });
  } catch (error: any) {
    console.error(error);

    if (error.message === "User already enrolled in this course") {
      return res.status(409).json({
        message: "You are already enrolled in this course",
      });
    }

    return res.status(500).json({
      message: "Enroll course failed",
    });
  }
}

export async function getMyEnrollmentsController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const enrollments = await getUserEnrollments(userId);

    return res.json(enrollments);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Get enrollments failed",
    });
  }
}

export async function checkEnrollmentController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const courseId = Number(req.params.courseId);

    const enrolled = await isUserEnrolled(userId, courseId);

    return res.json({
      enrolled,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Check enrollment failed",
    });
  }
}

export async function getCourseEnrollmentCountController(
  req: Request,
  res: Response,
) {
  try {
    const courseId = Number(req.params.courseId);

    const count = await getCourseEnrollmentCount(courseId);

    return res.json({
      count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Get enrollment count failed",
    });
  }
}
