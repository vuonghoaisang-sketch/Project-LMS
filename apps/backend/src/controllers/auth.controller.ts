import { Request, Response } from "express";

import { loginUser, registerUser } from "../services/auth.service";
import {
  validateLoginInput,
  validateRegisterInput,
} from "../validators/auth.validator";

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

  return res.status(200).json({
    success: true,
    message: "Login successfully",
    ...result,
  });
}

export async function getMe(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    user: (req as any).user,
  });
}
