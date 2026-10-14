import { Router } from "express";
import {
  getCommentsController,
  addCommentController,
  deleteCommentController,
} from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/lessons/:lessonId/comments", authMiddleware, getCommentsController);
router.post("/lessons/:lessonId/comments", authMiddleware, addCommentController);
router.delete("/comments/:commentId", authMiddleware, deleteCommentController);

export default router;
