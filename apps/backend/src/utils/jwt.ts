import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { CookieOptions } from "express";

const configuredSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === "production" && !configuredSecret) {
  throw new Error("JWT_SECRET must be set to a value of at least 32 characters");
}

if (configuredSecret && configuredSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

export const JWT_SECRET = configuredSecret ?? randomBytes(32).toString("hex");

const configuredRefreshSecret = process.env.JWT_REFRESH_SECRET;
export const JWT_REFRESH_SECRET =
  configuredRefreshSecret ?? `${JWT_SECRET}_refresh_secret_key_32bytes!`;

export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_DAYS = 7;

export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

export const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // 15 mins
  path: "/",
};

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};
