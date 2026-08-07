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

export async function findCourseById(id: number) {
  const [rows] = await db.query(
    `
    SELECT
      c.*,
      u.name AS instructor_name
    FROM courses c
    JOIN users u
      ON c.created_by = u.id
    WHERE c.id = ?
    `,
    [id],
  );

  const courses = rows as any[];

  return courses[0];
}

export async function updateCourse(id: number, course: Course) {
  const [result] = await db.execute(
    `
    UPDATE courses
    SET
      title = ?,
      description = ?,
      thumbnail = ?,
      price = ?
    WHERE id = ?
    `,
    [
      course.title,
      course.description ?? null,
      course.thumbnail ?? null,
      course.price ?? 0,
      id,
    ],
  );

  return result;
}

export async function deleteCourse(id: number) {
  const [result] = await db.execute(
    `
    DELETE FROM courses
    WHERE id = ?
    `,
    [id],
  );
  return result;
}
