import { Router } from "express";

import {
  createCourseController,
  getCoursesController,
} from "../controllers/course.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  createCourseController,
);

router.get("/", getCoursesController);

export default router;
