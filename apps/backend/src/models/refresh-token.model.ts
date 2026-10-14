import db from "../config/database";

export interface RefreshTokenRecord {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date | string;
  created_at: Date | string;
}

export async function createRefreshToken(
  userId: number,
  token: string,
  expiresAt: Date,
) {
  const [result] = await db.execute(
    `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES (?, ?, ?)
    `,
    [userId, token, expiresAt],
  );

  return result;
}

export async function findRefreshToken(
  token: string,
): Promise<RefreshTokenRecord | null> {
  const [rows] = await db.execute(
    `
    SELECT id, user_id, token, expires_at, created_at
    FROM refresh_tokens
    WHERE token = ?
    LIMIT 1
    `,
    [token],
  );

  const results = rows as RefreshTokenRecord[];
  return results[0] ?? null;
}

export async function deleteRefreshToken(token: string) {
  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE token = ?
    `,
    [token],
  );

  return result;
}

export async function deleteUserRefreshTokens(userId: number) {
  const [result] = await db.execute(
    `
    DELETE FROM refresh_tokens
    WHERE user_id = ?
    `,
    [userId],
  );

  return result;
}
