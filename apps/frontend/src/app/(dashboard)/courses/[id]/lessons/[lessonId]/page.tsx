'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById } from '@/services/lesson.service';
import { checkEnrollment } from '@/services/enrollment.service';
import {
  completeLesson,
  getCourseProgress,
} from '@/services/learning-progress.service';

import { Lesson } from '@/types/lesson';
import { useAuth } from '@/context/AuthContext';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import VideoPlayer from '@/components/lesson/VideoPlayer';
import { getErrorMessage } from '@/utils/error';

interface Props {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

export default function LessonDetailPage({ params }: Props) {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [error, setError] = useState('');

  const [courseId, setCourseId] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    async function loadLesson() {
      try {
        setLoading(true);
        setError('');

        const { id, lessonId } = await params;

        const courseIdNumber = Number(id);
        const lessonIdNumber = Number(lessonId);

        setCourseId(courseIdNumber);

        /*
         * Admin và Instructor
         * được xem lesson mà không cần enrollment.
         */
        if (user?.role === 'admin' || user?.role === 'instructor') {
          setHasAccess(true);
        } else {
          /*
           * Student phải enroll course
           * mới được xem lesson.
           */
          const enrollment = await checkEnrollment(courseIdNumber);

          if (!enrollment.enrolled) {
            setHasAccess(false);
            return;
          }

          setHasAccess(true);
        }

        const data = await getLessonById(lessonIdNumber);

        setLesson(data);

        if (user?.role === 'student') {
          const progress = await getCourseProgress(courseIdNumber);
          setCompleted(progress.completedLessonIds.includes(lessonIdNumber));
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [params, user, authLoading]);

  if (authLoading) {
    return <Loading />;
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load lesson"
        message={error}
        action={
          <button
            onClick={() => router.refresh()}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Retry
          </button>
        }
      />
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          You need to enroll in this course first.
        </h1>

        <p className="mt-3 text-slate-600">
          Please enroll in this course before accessing its lessons and learning materials.
        </p>

        <button
          onClick={() => {
            if (courseId) {
              router.push(`/courses/${courseId}`);
            }
          }}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white shadow hover:bg-blue-700 transition"
        >
          Go to Course
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <EmptyState
        title="Lesson not found"
        description="The lesson you're looking for does not exist."
        action={
          <button
            onClick={() => router.back()}
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Go Back
          </button>
        }
      />
    );
  }

  async function handleCompleteLesson() {
    if (!lesson) return;

    try {
      setCompleting(true);
      await completeLesson(lesson.id);
      setCompleted(true);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <button
        onClick={() => {
          if (courseId) {
            router.push(`/courses/${courseId}`);
          }
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
      >
        ← Back to Course
      </button>

      <div>
        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          Lesson {lesson.position}
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-950">
          {lesson.title}
        </h1>
      </div>

      {/* Video Player */}
      <VideoPlayer url={lesson.video_url} title={lesson.title} />

      {/* Description */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">About this lesson</h2>
        <p className="mt-3 whitespace-pre-line text-slate-600 leading-relaxed">
          {lesson.description || 'No description provided.'}
        </p>
      </div>

      {/* Attachments Section */}
      {lesson.attachments && lesson.attachments.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>📎 Downloadable Materials</span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {lesson.attachments.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lesson.attachments.map((att) => (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 hover:border-blue-400 hover:bg-blue-50/50 transition group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div className="truncate text-left">
                    <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                      {att.name}
                    </p>
                    {att.file_size > 0 && (
                      <p className="text-xs text-slate-400">
                        {(att.file_size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition">
                  Download ↓
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Completion Button for Student */}
      {user?.role === 'student' && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCompleteLesson}
            disabled={completed || completing}
            className={`rounded-xl px-6 py-3 font-semibold text-white shadow transition ${
              completed
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {completed
              ? '✓ Lesson Completed'
              : completing
                ? 'Saving Progress...'
                : 'Mark as Complete'}
          </button>
        </div>
      )}

      {/* Instructor / Admin Action Controls */}
      {(user?.role === 'admin' || user?.role === 'instructor') && (
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              if (courseId) {
                router.push(`/courses/${courseId}/lessons/${lesson.id}/edit`);
              }
            }}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
          >
            Edit Lesson
          </button>

          <button
            onClick={() => {
              if (courseId) {
                router.push(`/courses/${courseId}`);
              }
            }}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            Course Details
          </button>
        </div>
      )}
    </div>
  );
}
