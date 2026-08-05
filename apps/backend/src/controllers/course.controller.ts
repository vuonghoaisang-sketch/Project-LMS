import { Request, Response } from "express";

import { createNewCourse, getAllCourses } from "../services/course.service";

export async function createCourseController(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const course = await createNewCourse({
      ...req.body,
      created_by: user.id,
    });
    return res.status(201).json({
      message: "Create course successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Create course failed",
    });
  }
}

export async function getCoursesController(req: Request, res: Response) {
  try {
    const courses = await getAllCourses();

    return res.json(courses);
  } catch (error) {
    return res.status(500).json({
      message: "Get courses failed",
    });
  }
}
