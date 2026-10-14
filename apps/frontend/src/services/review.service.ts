import api from '@/lib/axios';
import { Review, CourseRatingStats } from '@/types/review';

export async function getCourseReviews(courseId: number): Promise<{
  reviews: Review[];
  stats: CourseRatingStats;
}> {
  const response = await api.get(`/courses/${courseId}/reviews`);
  return {
    reviews: response.data.reviews,
    stats: response.data.stats,
  };
}

export async function getMyReview(courseId: number): Promise<Review | null> {
  const response = await api.get(`/courses/${courseId}/my-review`);
  return response.data.review;
}

export async function submitReview(
  courseId: number,
  rating: number,
  content?: string,
): Promise<{ success: boolean; review: Review }> {
  const response = await api.post(`/courses/${courseId}/reviews`, {
    rating,
    content,
  });
  return response.data;
}
