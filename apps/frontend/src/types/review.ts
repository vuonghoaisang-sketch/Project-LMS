export interface Review {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_avatar?: string | null;
}

export interface CourseRatingStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}
