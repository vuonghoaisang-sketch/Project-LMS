import db from "../config/database";

export interface Course {
  id?: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price?: number;
  created_by?: number | null;
}

export async function createCourse(course: Course) {
  const [result] = await db.execute(
    `
    INSERT INTO courses
    (
      title,
      description,
      thumbnail,
      price,
      created_by
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      course.title,
      course.description ?? null,
      course.thumbnail ?? null,
      course.price ?? 0,
      course.created_by ?? null,
    ],
  );

  return result;
}

export async function getCourses() {
  const [rows] = await db.query(
    `
    SELECT
      courses.id,
      courses.title,
      courses.description,
      courses.thumbnail,
      courses.price,
      courses.created_at,
      users.id AS instructor_id,
      users.name AS instructor_name
    FROM courses
    LEFT JOIN users
    ON courses.created_by = users.id
    ORDER BY courses.created_at DESC
    `,
  );

  return rows;
}
