import db from "../config/database";

export interface Course {
  id?: number;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price?: number;
  created_by?: number | null;
}

export async function createCourse(course: {
  title: string;
  description: string;
  price: number;
  created_by: number;
}) {
  const [result] = await db.execute(
    `
    INSERT INTO courses
    (
      title,
      description,
      price,
      created_by
    )
    VALUES (?, ?, ?, ?)
    `,
    [course.title, course.description, course.price, course.created_by],
  );

  const insertId = (result as any).insertId;

  const [rows] = await db.execute(
    `
    SELECT
      c.id,
      c.title,
      c.description,
      c.thumbnail,
      c.price,
      c.created_by,
      c.created_at,
      u.name AS instructor_name
    FROM courses c
    JOIN users u ON c.created_by = u.id
    WHERE c.id = ?
    `,
    [insertId],
  );

  return (rows as any[])[0];
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

export async function findCourseOwnerById(id: number) {
  const [rows] = await db.execute(
    `
      SELECT id, created_by
      FROM courses
      WHERE id = ?
    `,
    [id],
  );

  const courses = rows as any[];

  return courses[0];
}
