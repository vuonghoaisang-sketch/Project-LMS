import { Router } from "express";

import {
  createCourseController,
  getCoursesController,
} from "../controllers/course.controller";
import { getCourseDetailController } from "../controllers/course.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { updateCourseController } from "../controllers/course.controller";
import { deleteCourseController } from "../controllers/course.controller";
const router = Router();

router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  createCourseController,
);

router.get("/", getCoursesController);
router.get("/:id", getCourseDetailController);
router.put("/:id", authMiddleware, updateCourseController);
router.delete("/:id", authMiddleware, deleteCourseController);
export default router;
