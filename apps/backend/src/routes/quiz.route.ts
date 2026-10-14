import { Router } from "express";
import {
  getLessonQuizController,
  getQuizForStudentController,
  getQuizForInstructorController,
  createQuizController,
  updateQuizController,
  deleteQuizController,
  submitQuizController,
  getMyBestAttemptController,
  getMyAttemptsController,
} from "../controllers/quiz.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// Check if a lesson has a quiz
router.get("/lessons/:lessonId/quiz", authMiddleware, getLessonQuizController);

// Instructor: full quiz management with answers
router.get(
  "/quizzes/:quizId/manage",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  getQuizForInstructorController,
);

// Student/all: take quiz (questions and options only, no answer flags)
router.get("/quizzes/:quizId", authMiddleware, getQuizForStudentController);

// Instructor: create quiz for a lesson
router.post(
  "/lessons/:lessonId/quiz",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  createQuizController,
);

// Instructor: update quiz
router.put(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  updateQuizController,
);

// Instructor: delete quiz
router.delete(
  "/quizzes/:quizId",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  deleteQuizController,
);

// Student: submit quiz attempt
router.post(
  "/quizzes/:quizId/submit",
  authMiddleware,
  requireRole(["student", "admin"]),
  submitQuizController,
);

// Student: get highest score attempt
router.get(
  "/quizzes/:quizId/my-attempt",
  authMiddleware,
  getMyBestAttemptController,
);

// Student: get all past attempts
router.get(
  "/quizzes/:quizId/my-attempts",
  authMiddleware,
  getMyAttemptsController,
);

export default router;
