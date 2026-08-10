import db from "../config/database";

export interface Enrollment {
  id?: number;
  user_id: number;
  course_id: number;
  enrolled_at?: Date;
}

export async function createEnrollment(userId: number, courseId: number) {
  const [result] = await db.execute(
    `
    INSERT INTO enrollments
    (
      user_id,
      course_id
    )
    VALUES (?, ?)
    `,
    [userId, courseId],
  );

  return result;
}

export async function findEnrollment(userId: number, courseId: number) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM enrollments
    WHERE user_id = ?
      AND course_id = ?
    `,
    [userId, courseId],
  );

  const enrollments = rows as any[];

  return enrollments[0];
}

export async function getEnrollmentsByUser(userId: number) {
  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.enrolled_at,
      c.id AS course_id,
      c.title,
      c.description,
      c.thumbnail,
      c.price
    FROM enrollments e
    JOIN courses c
      ON e.course_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
    `,
    [userId],
  );

  return rows;
}

export async function getEnrollmentCount(courseId: number) {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM enrollments
    WHERE course_id = ?
    `,
    [courseId],
  );

  const result = rows as any[];

  return result[0]?.total ?? 0;
}
