import { Request, Response } from "express";
import { registerUser } from "../services/auth.service";
import { loginUser } from "../services/auth.service";
import { getUserById } from "../services/auth.service";
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "Register successfully",
      user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Register failed",
    });
  }
}
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return res.status(200).json({
      message: "Login successfully",
      ...result,
    });
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: error instanceof Error ? error.message : "Login failed",
    });
  }
}
export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const user = await getUserById(userId);

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Get user failed",
    });
  }
}
