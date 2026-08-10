import { Router } from "express";

import {
  getUsers,
  updateRole,
  deleteUserController,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();

// =========================
// GET USERS
// ADMIN ONLY
// =========================

router.get("/", authMiddleware, requireRole(["admin"]), getUsers);

// =========================
// UPDATE USER ROLE
// ADMIN ONLY
// =========================

router.put("/:id/role", authMiddleware, requireRole(["admin"]), updateRole);

// =========================
// DELETE USER
// ADMIN ONLY
// =========================

router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin"]),
  deleteUserController,
);

export default router;
