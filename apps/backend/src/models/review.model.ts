import db from "../config/database";

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

export async function findReview(
  courseId: number,
  userId: number,
): Promise<Review | null> {
  const [rows] = await db.execute(
    "SELECT * FROM course_reviews WHERE course_id = ? AND user_id = ?",
    [courseId, userId],
  );
  return (rows as Review[])[0] ?? null;
}

export async function getReviewsByCourse(courseId: number): Promise<Review[]> {
  const [rows] = await db.execute(
    `SELECT r.*, u.name as user_name, u.avatar as user_avatar
     FROM course_reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.course_id = ?
     ORDER BY r.created_at DESC`,
    [courseId],
  );
  return rows as Review[];
}

export async function getCourseRatingStats(
  courseId: number,
): Promise<CourseRatingStats> {
  const [rows] = await db.execute(
    `SELECT rating, COUNT(*) as count FROM course_reviews WHERE course_id = ? GROUP BY rating`,
    [courseId],
  );
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0;
  let sum = 0;
  for (const row of rows as any[]) {
    const r = Number(row.rating);
    const count = Number(row.count);
    dist[r] = count;
    total += count;
    sum += r * count;
  }
  return {
    average_rating: total > 0 ? Math.round((sum / total) * 10) / 10 : 0,
    total_reviews: total,
    rating_distribution: dist as any,
  };
}

export async function upsertReview(data: {
  course_id: number;
  user_id: number;
  rating: number;
  content?: string;
}): Promise<Review> {
  const existing = await findReview(data.course_id, data.user_id);
  if (existing) {
    await db.execute(
      "UPDATE course_reviews SET rating = ?, content = ? WHERE course_id = ? AND user_id = ?",
      [data.rating, data.content ?? null, data.course_id, data.user_id],
    );
  } else {
    await db.execute(
      "INSERT INTO course_reviews (course_id, user_id, rating, content) VALUES (?, ?, ?, ?)",
      [data.course_id, data.user_id, data.rating, data.content ?? null],
    );
  }
  return (await findReview(data.course_id, data.user_id))!;
}
