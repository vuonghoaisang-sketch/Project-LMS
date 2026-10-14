import { Router } from "express";
import {
  getCourseReviewsController,
  submitReviewController,
  getMyReviewController,
} from "../controllers/review.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Public: get course reviews & statistics
router.get("/courses/:courseId/reviews", getCourseReviewsController);

// Authenticated: get my review for this course
router.get("/courses/:courseId/my-review", authMiddleware, getMyReviewController);

// Student: submit review (requires >= 50% completion enforced in service)
router.post(
  "/courses/:courseId/reviews",
  authMiddleware,
  requireRole(["student"]),
  submitReviewController,
);

export default router;
