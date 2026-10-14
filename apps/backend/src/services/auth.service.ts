import bcrypt from "bcrypt";
import { createUser, findUserByEmail, findUserById } from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_TOKEN_DAYS,
} from "../utils/jwt";
import {
  createRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteUserRefreshTokens,
} from "../models/refresh-token.model";
import AppError from "../utils/AppError";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const email = data.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  await createUser({
    name: data.name.trim(),
    email,
    password: hashedPassword,
  });

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Could not create the account", 500);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await findUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const payload = {
    id: Number(user.id),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );
  await createRefreshToken(user.id, refreshToken, expiresAt);

  return {
    accessToken,
    refreshToken,
    token: accessToken, // backward-compatibility for legacy headers/clients
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshSession(incomingRefreshToken: string) {
  if (!incomingRefreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const tokenRecord = await findRefreshToken(incomingRefreshToken);
  if (!tokenRecord) {
    throw new AppError("Refresh token has been revoked", 401);
  }

  if (new Date(tokenRecord.expires_at).getTime() < Date.now()) {
    await deleteRefreshToken(incomingRefreshToken);
    throw new AppError("Refresh token has expired", 401);
  }

  const user = await findUserById(tokenRecord.user_id);
  if (!user) {
    throw new AppError("User account no longer exists", 401);
  }

  // Token rotation: delete old refresh token and issue a fresh pair
  await deleteRefreshToken(incomingRefreshToken);

  const payload = {
    id: Number(user.id),
    email: user.email,
    role: user.role,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );
  await createRefreshToken(user.id, newRefreshToken, expiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    token: newAccessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function logoutUser(refreshToken?: string, userId?: number) {
  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  } else if (userId) {
    await deleteUserRefreshTokens(userId);
  }

  return true;
}
