import db from "../config/database";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

export async function createUser(user: User) {
  const [result] = await db.execute(
    `
    INSERT INTO users
    (
      name,
      email,
      password
    )
    VALUES (?, ?, ?)
    `,
    [user.name, user.email, user.password],
  );

  return result;
}
export async function findUserByEmail(email: string) {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM users
    WHERE email = ?
    `,
    [email],
  );

  return (rows as any[])[0];
}
