import db from "../config/database";

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

// =========================
// CREATE USER
// =========================

export async function createUser(user: User) {
  const [result] = await db.execute(
    `
    INSERT INTO users
    (
      name,
      email,
      password,
      role
    )
    VALUES (?, ?, ?, ?)
    `,
    [user.name, user.email, user.password, user.role ?? "student"],
  );

  return result;
}

// =========================
// FIND USER BY EMAIL
// =========================

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

// =========================
// FIND USER BY ID
// =========================

export async function findUserById(id: number) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      role
    FROM users
    WHERE id = ?
    `,
    [id],
  );

  const users = rows as any[];

  return users[0];
}

// =========================
// GET ALL USERS
// =========================

export async function getAllUsers() {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      role
    FROM users
    ORDER BY id DESC
    `,
  );

  return rows;
}

// =========================
// UPDATE USER ROLE
// =========================

export async function updateUserRole(id: number, role: string) {
  const [result] = await db.execute(
    `
    UPDATE users
    SET role = ?
    WHERE id = ?
    `,
    [role, id],
  );

  return result;
}

// =========================
// DELETE USER
// =========================

export async function deleteUser(id: number) {
  const [result] = await db.execute(
    `
    DELETE FROM users
    WHERE id = ?
    `,
    [id],
  );

  return result;
}
