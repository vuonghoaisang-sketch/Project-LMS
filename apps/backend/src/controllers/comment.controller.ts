import { Request, Response } from "express";
import {
  getLessonComments,
  addComment,
  deleteCommentService,
} from "../services/comment.service";

export async function getCommentsController(req: Request, res: Response) {
  const lessonId = Number(req.params.lessonId);
  const comments = await getLessonComments(lessonId);
  return res.json({ success: true, comments });
}

export async function addCommentController(req: Request, res: Response) {
  const lessonId = Number(req.params.lessonId);
  const user = (req as any).user;
  const { content, parent_id } = req.body;

  if (!content || String(content).trim().length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Content is required" });
  }

  const comment = await addComment(
    lessonId,
    user.id,
    String(content),
    parent_id ? Number(parent_id) : undefined,
  );
  return res.status(201).json({ success: true, comment });
}

export async function deleteCommentController(req: Request, res: Response) {
  const commentId = Number(req.params.commentId);
  const user = (req as any).user;
  await deleteCommentService(commentId, user.id, user.role);
  return res.json({ success: true, message: "Comment deleted" });
}
