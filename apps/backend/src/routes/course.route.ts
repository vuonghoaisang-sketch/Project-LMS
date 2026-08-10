import { Router } from "express";

import {
  createCourseController,
  getCoursesController,
  getCourseDetailController,
  updateCourseController,
  deleteCourseController,
} from "../controllers/course.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { requireCourseOwner } from "../middlewares/ownership.middleware";

const router = Router();

// Create Course
// Admin + Instructor
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  createCourseController,
);

// Get Courses
// Public
router.get("/", getCoursesController);

// Get Course Detail
// Public
router.get("/:id", getCourseDetailController);

// Update Course
// Admin → tất cả course
// Instructor → chỉ course của mình
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  updateCourseController,
);

// Delete Course
// Admin → tất cả course
// Instructor → chỉ course của mình
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  deleteCourseController,
);

export default router;
