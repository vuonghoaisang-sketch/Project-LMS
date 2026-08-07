import { Request, Response } from "express";
import { getCourseById } from "../services/course.service";
import { createNewCourse, getAllCourses } from "../services/course.service";
import { updateCourseService } from "../services/course.service";
import { deleteCourseService } from "../services/course.service";

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
export async function getCourseDetailController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const course = await getCourseById(id);

    return res.json(course);
  } catch (error) {
    return res.status(404).json({
      message: error instanceof Error ? error.message : "Course not found",
    });
  }
}

export async function updateCourseController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const course = await updateCourseService(id, req.body);

    return res.json({
      message: "Update course successfully",
      course,
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Update failed",
    });
  }
}

export async function deleteCourseController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await deleteCourseService(id);
    return res.json({
      message: "Delete course successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Delete failed",
    });
  }
}
