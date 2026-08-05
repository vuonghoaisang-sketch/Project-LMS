import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);

router.post("/login", login);

// protected route
router.get("/me", authMiddleware, getMe);

export default router;
