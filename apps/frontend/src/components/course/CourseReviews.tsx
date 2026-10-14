'use client';

import { useState, useEffect } from 'react';
import { Review, CourseRatingStats } from '@/types/review';
import { getCourseReviews, submitReview, getMyReview } from '@/services/review.service';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/error';

interface CourseReviewsProps {
  courseId: number;
  userProgressPercent?: number;
  isEnrolled?: boolean;
}

export default function CourseReviews({
  courseId,
  userProgressPercent = 0,
  isEnrolled = false,
}: CourseReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<CourseRatingStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getCourseReviews(courseId);
      setReviews(data.reviews);
      setStats(data.stats);

      if (user) {
        const my = await getMyReview(courseId);
        if (my) {
          setRating(my.rating);
          setContent(my.content || '');
        }
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);
      const res = await submitReview(courseId, rating, content);
      setSuccess('Review submitted successfully!');
      setReviews((prev) => {
        const filtered = prev.filter((r) => r.user_id !== user?.id);
        return [res.review, ...filtered];
      });
      // reload stats
      const refreshed = await getCourseReviews(courseId);
      setStats(refreshed.stats);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const canReview = isEnrolled && userProgressPercent >= 50;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-8">
      <div>
        <h3 className="text-xl font-bold text-slate-900">
          Course Ratings & Reviews
        </h3>
        <p className="text-xs text-slate-500">
          Student feedback and verified satisfaction ratings
        </p>
      </div>

      {/* Ratings Summary Card */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-2xl bg-slate-50 p-6 border border-slate-100 items-center">
          <div className="text-center sm:border-r border-slate-200 sm:pr-6">
            <span className="text-5xl font-black text-slate-900">
              {stats.average_rating > 0 ? stats.average_rating.toFixed(1) : '—'}
            </span>
            <div className="mt-1 flex justify-center text-amber-400 text-lg">
              {'★'.repeat(Math.round(stats.average_rating))}
              {'☆'.repeat(5 - Math.round(stats.average_rating))}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {stats.total_reviews} verified {stats.total_reviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Breakdown bars */}
          <div className="sm:col-span-2 space-y-1.5 text-xs text-slate-600">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.rating_distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent =
                stats.total_reviews > 0
                  ? Math.round((count / stats.total_reviews) * 100)
                  : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="w-12 text-right font-medium">{stars} stars</span>
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review Submission Form */}
      {user && isEnrolled && (
        <div className="pt-4 border-t border-slate-100">
          {canReview ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900">
                Write a Review for this Course
              </h4>

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200">
                  {success}
                </div>
              )}

              {/* Star selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rating:
                </label>
                <div className="flex gap-1 text-2xl cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className={`transition ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 scale-110'
                          : 'text-slate-300'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your feedback:
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what you liked about this course, key takeaways, and how it helped you..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-600 focus:outline-none"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-200">
              🔒 <strong>Course Review Locked:</strong> You have completed {userProgressPercent}% of this course. You can submit a course review once you have completed at least <strong>50%</strong> of the curriculum.
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="font-bold text-sm text-slate-900">
          Student Reviews ({reviews.length})
        </h4>

        {loading ? (
          <p className="text-xs text-slate-400 py-3">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            No reviews yet. Be the first to review this course after reaching 50% progress!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {rev.user_avatar ? (
                      <img
                        src={rev.user_avatar}
                        alt={rev.user_name || 'User'}
                        className="h-7 w-7 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {rev.user_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="font-bold text-xs text-slate-900">
                      {rev.user_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs">
                      {'★'.repeat(rev.rating)}
                      {'☆'.repeat(5 - rev.rating)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {rev.content && (
                  <p className="text-xs text-slate-700 pl-9 whitespace-pre-line leading-relaxed">
                    {rev.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
