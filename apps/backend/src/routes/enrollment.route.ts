import express from "express";

import {
  enrollCourseController,
  getMyEnrollmentsController,
  checkEnrollmentController,
  getCourseEnrollmentCountController,
} from "../controllers/enrollment.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = express.Router();

// ========================================
// ENROLL COURSE
// ========================================

// POST /api/enrollments
// Student only
router.post(
  "/",
  authMiddleware,
  requireRole(["student"]),
  enrollCourseController,
);

// ========================================
// MY COURSES
// ========================================

// GET /api/enrollments/my
// Student only
router.get(
  "/my",
  authMiddleware,
  requireRole(["student"]),
  getMyEnrollmentsController,
);

// ========================================
// CHECK ENROLLMENT
// ========================================

// GET /api/enrollments/check/:courseId
// Student only
router.get(
  "/check/:courseId",
  authMiddleware,
  requireRole(["student"]),
  checkEnrollmentController,
);

// ========================================
// COURSE ENROLLMENT COUNT
// ========================================

// GET /api/enrollments/course/:courseId/count
// Public
router.get("/course/:courseId/count", getCourseEnrollmentCountController);

export default router;
