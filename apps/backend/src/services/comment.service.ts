import {
  getCommentsByLesson,
  findCommentById,
  createComment,
  softDeleteComment,
  getParentCommentInfo,
} from "../models/comment.model";
import { createNotification } from "../models/notification.model";
import AppError from "../utils/AppError";

export async function getLessonComments(lessonId: number) {
  return getCommentsByLesson(lessonId);
}

export async function addComment(
  lessonId: number,
  userId: number,
  content: string,
  parentId?: number,
) {
  if (!content || content.trim().length < 1) {
    throw new AppError("Comment cannot be empty", 400);
  }
  if (content.length > 5000) {
    throw new AppError("Comment too long (max 5000 characters)", 400);
  }

  const comment = await createComment({
    lesson_id: lessonId,
    user_id: userId,
    content: content.trim(),
    parent_id: parentId ?? null,
  });

  // Notify parent comment author if this is a reply
  if (parentId) {
    const parentInfo = await getParentCommentInfo(parentId);
    if (parentInfo && parentInfo.user_id !== userId) {
      await createNotification({
        user_id: parentInfo.user_id,
        type: "comment_reply",
        message: "Someone replied to your question/comment.",
        reference_id: comment.id,
        reference_type: "comment",
      });
    }
  }

  return comment;
}

export async function deleteCommentService(
  commentId: number,
  userId: number,
  userRole: string,
) {
  const comment = await findCommentById(commentId);
  if (!comment) throw new AppError("Comment not found", 404);
  if (
    comment.user_id !== userId &&
    userRole !== "admin" &&
    userRole !== "instructor"
  ) {
    throw new AppError("You can only delete your own comments", 403);
  }
  await softDeleteComment(commentId);
}
