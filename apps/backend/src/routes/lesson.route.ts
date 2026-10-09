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

import { requireCourseEnrollment } from "../middlewares/course-access.middleware";
import { requireLessonEnrollment } from "../middlewares/enrollment.middleware";
import {
  completeLessonController,
  getCourseProgressController,
} from "../controllers/learning-progress.controller";

const router = Router();

router.get(
  "/courses/:courseId/progress",
  authMiddleware,
  requireRole(["student"]),
  requireCourseEnrollment,
  getCourseProgressController,
);

router.post(
  "/lessons/:id/complete",
  authMiddleware,
  requireRole(["student"]),
  requireLessonEnrollment,
  completeLessonController,
);

router.post(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  createLessonController,
);

router.get(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireCourseEnrollment,
  getLessonsController,
);

router.get(
  "/lessons/:id",
  authMiddleware,
  requireLessonEnrollment,
  getLessonController,
);

router.put(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  updateLessonController,
);

router.delete(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  deleteLessonController,
);

export default router;
