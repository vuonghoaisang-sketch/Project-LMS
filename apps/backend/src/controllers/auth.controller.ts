import { Request, Response } from "express";

import {
  loginUser,
  registerUser,
  refreshSession,
  logoutUser,
} from "../services/auth.service";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validators/auth.validator";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const errors = validateRegisterInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const user = await registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Register successfully",
    user,
  });
}

export async function login(req: Request, res: Response) {
  const errors = validateLoginInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const result = await loginUser(req.body.email, req.body.password);

  // Set secure HttpOnly cookies for web browsers
  res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Login successfully",
    ...result,
  });
}

export async function refreshToken(req: Request, res: Response) {
  const incomingToken =
    req.cookies?.refreshToken ?? (req.body?.refreshToken as string | undefined);

  if (!incomingToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token is missing",
    });
  }

  const result = await refreshSession(incomingToken);

  res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
  res.cookie("refreshToken", result.refreshToken, refreshTokenCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    ...result,
  });
}

export async function logout(req: Request, res: Response) {
  const incomingToken =
    req.cookies?.refreshToken ?? (req.body?.refreshToken as string | undefined);
  const userId = (req as any).user?.id as number | undefined;

  await logoutUser(incomingToken, userId);

  res.clearCookie("accessToken", clearCookieOptions);
  res.clearCookie("refreshToken", clearCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getMe(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    user: (req as any).user,
  });
}
