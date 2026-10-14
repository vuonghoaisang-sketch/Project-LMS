import { Request, Response } from "express";
import {
  getCourseReviews,
  submitReview,
  getMyReview,
} from "../services/review.service";

export async function getCourseReviewsController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const data = await getCourseReviews(courseId);
  return res.json({ success: true, ...data });
}

export async function submitReviewController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const user = (req as any).user;
  const { rating, content } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be between 1 and 5 stars" });
  }

  const review = await submitReview(
    courseId,
    user.id,
    Number(rating),
    content ? String(content).trim() : undefined,
  );
  return res.json({
    success: true,
    message: "Thank you for reviewing this course!",
    review,
  });
}

export async function getMyReviewController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);
  const user = (req as any).user;
  const review = await getMyReview(courseId, user.id);
  return res.json({ success: true, review: review ?? null });
}
