import { Request, Response } from "express";

import { getAllUsers, updateUserRole, deleteUser } from "../models/user.model";

// =========================
// GET ALL USERS
// =========================

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Get users failed",
    });
  }
}

// =========================
// UPDATE USER ROLE
// =========================

export async function updateRole(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const { role } = req.body;

    const allowedRoles = ["admin", "instructor", "student"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    await updateUserRole(id, role);

    return res.status(200).json({
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Update user role failed",
    });
  }
}

// =========================
// DELETE USER
// =========================

export async function deleteUserController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    await deleteUser(id);

    return res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Delete user failed",
    });
  }
}
