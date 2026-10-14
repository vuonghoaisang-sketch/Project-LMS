import { Request, Response } from "express";
import {
  getQuizForLesson,
  getQuizDetailsForInstructor,
  getQuizForStudent,
  createQuizForLesson,
  updateQuizService,
  deleteQuizService,
  submitQuizAttempt,
  getMyBestAttempt,
  getMyAttempts,
} from "../services/quiz.service";

export async function getLessonQuizController(req: Request, res: Response) {
  const lessonId = Number(req.params.lessonId);
  const quiz = await getQuizForLesson(lessonId);
  return res.json({ success: true, quiz: quiz ?? null });
}

export async function getQuizForStudentController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  const quiz = await getQuizForStudent(quizId);
  return res.json({ success: true, quiz });
}

export async function getQuizForInstructorController(
  req: Request,
  res: Response,
) {
  const quizId = Number(req.params.quizId);
  const quiz = await getQuizDetailsForInstructor(quizId);
  return res.json({ success: true, quiz });
}

export async function createQuizController(req: Request, res: Response) {
  const lessonId = Number(req.params.lessonId);
  const {
    title,
    description,
    time_limit_minutes,
    passing_score,
    is_required,
    questions,
  } = req.body;

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title and at least 1 question are required",
    });
  }

  const quiz = await createQuizForLesson(lessonId, {
    title: String(title).trim(),
    description: description ? String(description).trim() : undefined,
    time_limit_minutes: Number(time_limit_minutes) || 10,
    passing_score: Number(passing_score) || 80,
    is_required: Boolean(is_required),
    questions,
  });

  return res
    .status(201)
    .json({ success: true, message: "Quiz created successfully", quiz });
}

export async function updateQuizController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  const {
    title,
    description,
    time_limit_minutes,
    passing_score,
    is_required,
    questions,
  } = req.body;

  if (!title || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Title and at least 1 question are required",
    });
  }

  const quiz = await updateQuizService(quizId, {
    title: String(title).trim(),
    description: description ? String(description).trim() : undefined,
    time_limit_minutes: Number(time_limit_minutes) || 10,
    passing_score: Number(passing_score) || 80,
    is_required: Boolean(is_required),
    questions,
  });

  return res.json({ success: true, message: "Quiz updated successfully", quiz });
}

export async function deleteQuizController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  await deleteQuizService(quizId);
  return res.json({ success: true, message: "Quiz deleted successfully" });
}

export async function submitQuizController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  const user = (req as any).user;
  const { answers, time_taken_seconds } = req.body;

  if (!Array.isArray(answers)) {
    return res
      .status(400)
      .json({ success: false, message: "Answers must be an array" });
  }

  const result = await submitQuizAttempt(
    quizId,
    user.id,
    answers,
    Number(time_taken_seconds) || 0,
  );
  return res.json({ success: true, ...result });
}

export async function getMyBestAttemptController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  const user = (req as any).user;
  const attempt = await getMyBestAttempt(quizId, user.id);
  return res.json({ success: true, attempt: attempt ?? null });
}

export async function getMyAttemptsController(req: Request, res: Response) {
  const quizId = Number(req.params.quizId);
  const user = (req as any).user;
  const attempts = await getMyAttempts(quizId, user.id);
  return res.json({ success: true, attempts });
}
