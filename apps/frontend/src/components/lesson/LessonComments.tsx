'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types/comment';
import {
  getLessonComments,
  addComment,
  deleteComment,
} from '@/services/comment.service';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/error';

interface LessonCommentsProps {
  lessonId: number;
}

export default function LessonComments({ lessonId }: LessonCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadComments();
  }, [lessonId]);

  async function loadComments() {
    try {
      setLoading(true);
      const data = await getLessonComments(lessonId);
      setComments(data);
    } catch (err) {
      console.warn('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTopLevel(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const created = await addComment(lessonId, newComment.trim());
      setComments((prev) => [...prev, created]);
      setNewComment('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddReply(parentId: number) {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const reply = await addComment(lessonId, replyContent.trim(), parentId);
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c,
        ),
      );
      setReplyContent('');
      setReplyingTo(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId: number, isReply = false, parentId?: number) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(commentId);
      if (isReply && parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? {
                  ...c,
                  replies: (c.replies || []).filter((r) => r.id !== commentId),
                }
              : c,
          ),
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h3 className="text-xl font-bold text-slate-900">
          Q&A & Discussion ({comments.length})
        </h3>
        <span className="text-xs text-slate-500">Ask questions or share thoughts</span>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* New Top-Level Comment Input */}
      {user ? (
        <form onSubmit={handleAddTopLevel} className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question about this lesson or start a discussion..."
            rows={3}
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </form>
      ) : (
        <p className="text-xs text-slate-500 italic">
          Please log in to participate in the lesson discussion.
        </p>
      )}

      {/* Comments List */}
      {loading ? (
        <p className="text-xs text-slate-400 py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          No discussions yet. Be the first to ask a question!
        </p>
      ) : (
        <div className="space-y-6 pt-2">
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Comment Header & Content */}
              <div className="flex items-start gap-3">
                {comment.user_avatar ? (
                  <img
                    src={comment.user_avatar}
                    alt={comment.user_name || 'User'}
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                    {comment.user_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                <div className="flex-1 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {comment.user_name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                    {user && (
                      <button
                        onClick={() =>
                          setReplyingTo(replyingTo === comment.id ? null : comment.id)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Reply ↵
                      </button>
                    )}

                    {(user?.id === comment.user_id ||
                      user?.role === 'admin' ||
                      user?.role === 'instructor') && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Reply Form */}
              {replyingTo === comment.id && (
                <div className="ml-11 flex gap-2">
                  <input
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 rounded-xl border p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddReply(comment.id)}
                    disabled={submitting || !replyContent.trim()}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-11 space-y-3 border-l-2 border-slate-200 pl-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-2.5">
                      {reply.user_avatar ? (
                        <img
                          src={reply.user_avatar}
                          alt={reply.user_name || 'User'}
                          className="h-6 w-6 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}

                      <div className="flex-1 rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-800">
                            {reply.user_name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                        {(user?.id === reply.user_id ||
                          user?.role === 'admin' ||
                          user?.role === 'instructor') && (
                          <button
                            onClick={() => handleDelete(reply.id, true, comment.id)}
                            className="mt-2 text-[10px] text-slate-400 hover:text-red-500 font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
