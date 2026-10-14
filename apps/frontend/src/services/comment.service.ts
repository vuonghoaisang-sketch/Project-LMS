import api from '@/lib/axios';
import { Comment } from '@/types/comment';

export async function getLessonComments(lessonId: number): Promise<Comment[]> {
  const response = await api.get(`/lessons/${lessonId}/comments`);
  return response.data.comments;
}

export async function addComment(
  lessonId: number,
  content: string,
  parentId?: number,
): Promise<Comment> {
  const response = await api.post(`/lessons/${lessonId}/comments`, {
    content,
    parent_id: parentId,
  });
  return response.data.comment;
}

export async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/comments/${commentId}`);
}
