import { Router } from "express";
import { requireCourseEnrollment } from "../middlewares/course-access.middleware";
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

import { requireLessonEnrollment } from "../middlewares/enrollment.middleware";

const router = Router();

// ========================================
// COURSE LESSONS
// ========================================

// POST /api/courses/:courseId/lessons
// Admin + Instructor
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
router.get(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireCourseEnrollment,
  getLessonsController,
);

// ========================================
// LESSON
// ========================================

// GET /api/lessons/:id
// Student phải enroll mới được xem
// Admin + Instructor có thể xem
//0988697737
router.get(
  "/lessons/:id",
  authMiddleware,
  requireLessonEnrollment,
  getLessonController,
);

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
