import { Router } from "express";

import {
  createLessonController,
  getLessonsController,
  getLessonController,
  updateLessonController,
  deleteLessonController,
} from "../controllers/lesson.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// /api/courses/:courseId/lessons

router.post(
  "/courses/:courseId/lessons",
  authMiddleware,
  createLessonController,
);

router.get("/courses/:courseId/lessons", getLessonsController);

// /api/lessons/:id

router.get("/lessons/:id", getLessonController);

router.put("/lessons/:id", authMiddleware, updateLessonController);

router.delete("/lessons/:id", authMiddleware, deleteLessonController);

export default router;
