import { Router } from "express";
import {
  getNotificationsController,
  markReadController,
  getUnreadCountController,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotificationsController);
router.get("/unread-count", authMiddleware, getUnreadCountController);
router.patch("/mark-read", authMiddleware, markReadController);

export default router;
