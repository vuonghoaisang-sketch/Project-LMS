import { Request, Response } from "express";

import {
  getCourseById,
  createNewCourse,
  getAllCourses,
  updateCourseService,
  deleteCourseService,
} from "../services/course.service";

import { validateCourseInput } from "../validators/course.validator";

export async function createCourseController(req: Request, res: Response) {
  const errors = validateCourseInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const user = (req as any).user;

  const course = await createNewCourse({
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    category: typeof req.body.category === "string" ? req.body.category.trim() : "General",
    thumbnail: typeof req.body.thumbnail === "string" ? req.body.thumbnail.trim() : null,
    price: Number(req.body.price),
    created_by: user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Create course successfully",
    course,
  });
}

export async function getCoursesController(req: Request, res: Response) {
  const courses = await getAllCourses();

  return res.json({
    success: true,
    courses,
  });
}

export async function getCourseDetailController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const course = await getCourseById(id);

  return res.json({
    success: true,
    course,
  });
}

export async function updateCourseController(req: Request, res: Response) {
  const errors = validateCourseInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const course = await updateCourseService(id, {
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    category: typeof req.body.category === "string" ? req.body.category.trim() : "General",
    thumbnail: typeof req.body.thumbnail === "string" ? req.body.thumbnail.trim() : null,
    price: Number(req.body.price),
  });

  return res.json({
    success: true,
    message: "Update course successfully",
    course,
  });
}

export async function deleteCourseController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  await deleteCourseService(id);

  return res.json({
    success: true,
    message: "Delete course successfully",
  });
}
