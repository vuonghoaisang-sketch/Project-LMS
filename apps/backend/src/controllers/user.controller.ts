import { Request, Response } from "express";

import {
  deleteUser as deleteUserRecord,
  getAllUsers,
  updateUserRole,
} from "../models/user.model";
import AppError from "../utils/AppError";

const allowedRoles = ["admin", "instructor", "student"] as const;

function getTargetUserId(rawId: string | string[] | undefined) {
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError("Invalid user id", 400);
  }
  return id;
}

export async function getUsers(_req: Request, res: Response) {
  const users = await getAllUsers();
  return res.status(200).json({ success: true, users });
}

export async function updateRole(req: Request, res: Response) {
  const id = getTargetUserId(req.params.id);
  const { role } = req.body as { role?: string };

  if (
    typeof role !== "string" ||
    !allowedRoles.includes(role as (typeof allowedRoles)[number])
  ) {
    throw new AppError("Invalid role", 400);
  }

  const currentUser = (req as any).user;
  if (currentUser.id === id && role !== "admin") {
    throw new AppError("You cannot remove your own admin role", 409);
  }

  const result = await updateUserRole(id, role);
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "User role updated successfully",
  });
}

export async function deleteUserController(req: Request, res: Response) {
  const id = getTargetUserId(req.params.id);
  const currentUser = (req as any).user;

  if (currentUser.id === id) {
    throw new AppError("You cannot delete your own account here", 409);
  }

  const result = await deleteUserRecord(id);
  if ((result as { affectedRows?: number }).affectedRows === 0) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
}
