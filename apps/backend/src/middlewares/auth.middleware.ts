import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { findUserById } from "../models/user.model";
import { JWT_SECRET } from "../utils/jwt";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication is required",
    });
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired",
    });
  }

  const userId = typeof decoded === "object" ? Number(decoded.id) : NaN;
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired",
    });
  }

  try {
    const user = await findUserById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This account is no longer available",
      });
    }

    // Read the current role from the database so deleted accounts and role
    // changes take effect immediately, even while an older JWT still exists.
    (req as any).user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
