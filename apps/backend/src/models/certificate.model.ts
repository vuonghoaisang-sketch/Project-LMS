import db from "../config/database";

export interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_code: string;
  issued_at: string;
  user_name?: string;
  course_title?: string;
}

export async function findCertificate(
  userId: number,
  courseId: number,
): Promise<Certificate | null> {
  const [rows] = await db.execute(
    `SELECT c.*, u.name as user_name, co.title as course_title
     FROM certificates c
     JOIN users u ON c.user_id = u.id
     JOIN courses co ON c.course_id = co.id
     WHERE c.user_id = ? AND c.course_id = ?
     LIMIT 1`,
    [userId, courseId],
  );
  return (rows as Certificate[])[0] ?? null;
}

export async function findCertificateByCode(
  code: string,
): Promise<Certificate | null> {
  const [rows] = await db.execute(
    `SELECT c.*, u.name as user_name, co.title as course_title
     FROM certificates c
     JOIN users u ON c.user_id = u.id
     JOIN courses co ON c.course_id = co.id
     WHERE c.certificate_code = ?
     LIMIT 1`,
    [code],
  );
  return (rows as Certificate[])[0] ?? null;
}

export async function createCertificate(data: {
  user_id: number;
  course_id: number;
  certificate_code: string;
}): Promise<Certificate> {
  await db.execute(
    "INSERT INTO certificates (user_id, course_id, certificate_code) VALUES (?, ?, ?)",
    [data.user_id, data.course_id, data.certificate_code],
  );
  return (await findCertificate(data.user_id, data.course_id))!;
}

export async function getUserCertificates(
  userId: number,
): Promise<Certificate[]> {
  const [rows] = await db.execute(
    `SELECT c.*, u.name as user_name, co.title as course_title
     FROM certificates c
     JOIN users u ON c.user_id = u.id
     JOIN courses co ON c.course_id = co.id
     WHERE c.user_id = ?
     ORDER BY c.issued_at DESC`,
    [userId],
  );
  return rows as Certificate[];
}
