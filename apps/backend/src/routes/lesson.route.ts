import { Router } from "express";

import {
  createLessonController,
  getLessonsController,
  getLessonController,
  updateLessonController,
  deleteLessonController,
} from "../controllers/lesson.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import {
  requireCourseOwner,
  requireLessonOwner,
} from "../middlewares/ownership.middleware";

const router = Router();

// ========================================
// COURSE LESSONS
// ========================================

// POST /api/courses/:courseId/lessons
// Admin + Instructor
//
// Instructor chỉ được tạo lesson
// trong course của chính mình.
router.post(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  createLessonController,
);

// GET /api/courses/:courseId/lessons
// Public
router.get("/courses/:courseId/lessons", getLessonsController);

// ========================================
// LESSON
// ========================================

// GET /api/lessons/:id
// Public / enrollment logic xử lý ở tầng khác
router.get("/lessons/:id", getLessonController);

// PUT /api/lessons/:id
// Admin → tất cả
// Instructor → lesson thuộc course của mình
router.put(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  updateLessonController,
);

// DELETE /api/lessons/:id
// Admin → tất cả
// Instructor → lesson thuộc course của mình
router.delete(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  deleteLessonController,
);

export default router;
