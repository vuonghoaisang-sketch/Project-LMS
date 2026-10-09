import { Request, Response, NextFunction } from "express";

import AppError from "../utils/AppError";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const safeError = error as { code?: string; type?: string; message?: string };

  console.error("API request error", {
    method: req.method,
    path: req.path,
    code: safeError?.code,
    type: safeError?.type,
  });

  if (safeError?.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain valid JSON",
    });
  }

  if (safeError?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      success: false,
      message: "Data already exists",
    });
  }

  if (error.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      success: false,
      message: "Referenced data does not exist",
    });
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json({
      success: false,
      message: "Cannot delete this data because it is being used",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
