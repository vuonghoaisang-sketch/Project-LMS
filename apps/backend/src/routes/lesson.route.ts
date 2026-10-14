import { Router } from "express";

import {
  createLessonController,
  getLessonsController,
  getLessonController,
  updateLessonController,
  deleteLessonController,
  addAttachmentController,
  deleteAttachmentController,
  getAttachmentsController,
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

// Student course progress
router.get(
  "/courses/:courseId/progress",
  authMiddleware,
  requireRole(["student"]),
  requireCourseEnrollment,
  getCourseProgressController,
);

// Student lesson completion
router.post(
  "/lessons/:id/complete",
  authMiddleware,
  requireRole(["student"]),
  requireLessonEnrollment,
  completeLessonController,
);

// Course lessons CRUD
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

// Lesson attachments
router.get(
  "/lessons/:id/attachments",
  authMiddleware,
  requireLessonEnrollment,
  getAttachmentsController,
);

router.post(
  "/lessons/:id/attachments",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  addAttachmentController,
);

router.delete(
  "/lessons/attachments/:attachmentId",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  deleteAttachmentController,
);

export default router;
