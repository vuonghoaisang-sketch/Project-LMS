import {
  findReview,
  getReviewsByCourse,
  getCourseRatingStats,
  upsertReview,
} from "../models/review.model";
import { findCourseById } from "../models/course.model";
import { getCourseProgressRows } from "../models/learning-progress.model";
import AppError from "../utils/AppError";

export async function getCourseReviews(courseId: number) {
  const reviews = await getReviewsByCourse(courseId);
  const stats = await getCourseRatingStats(courseId);
  return { reviews, stats };
}

export async function submitReview(
  courseId: number,
  userId: number,
  rating: number,
  content?: string,
) {
  const course = await findCourseById(courseId);
  if (!course) throw new AppError("Course not found", 404);
  if (rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5 stars", 400);
  }

  // Check 50% course progress requirement
  const progressRows = await getCourseProgressRows(userId, courseId);
  const total = progressRows.length;
  const completed = progressRows.filter((r) => r.completed_at !== null).length;
  const percent = total > 0 ? (completed / total) * 100 : 0;

  if (percent < 50) {
    throw new AppError(
      `You have completed ${Math.round(percent)}% of the course. You need at least 50% completion to submit a review.`,
      403,
    );
  }

  const review = await upsertReview({
    course_id: courseId,
    user_id: userId,
    rating,
    content,
  });
  return review;
}

export async function getMyReview(courseId: number, userId: number) {
  return findReview(courseId, userId);
}
