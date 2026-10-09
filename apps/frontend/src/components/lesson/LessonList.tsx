'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { deleteLesson, getLessonsByCourse } from '@/services/lesson.service';
import { getErrorMessage } from '@/utils/error';
import { Lesson } from '@/types/lesson';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

export default function LessonList({
  courseId,
  canManage = false,
}: {
  courseId: number;
  canManage?: boolean;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await getLessonsByCourse(courseId);
        if (active) setLessons(data);
      } catch (error) {
        console.error(error);
        if (active) setError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [courseId]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this lesson?')) return;

    try {
      await deleteLesson(id);
      setLessons((current) => current.filter((lesson) => lesson.id !== id));
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error));
    }
  }

  return (
    <section className="mt-10" aria-labelledby="lesson-list-title">
      <h2 id="lesson-list-title" className="mb-5 text-2xl font-bold">
        Lessons
      </h2>

      {loading ? (
        <LoadingState message="Loading lessons..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : lessons.length === 0 ? (
        <EmptyState message="This course has no lessons yet." />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">
                  {lesson.position}. {lesson.title}
                </h3>
                {lesson.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {lesson.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
                  className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800"
                >
                  View Lesson
                </Link>
                {canManage && (
                  <>
                    <Link
                      href={`/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.id)}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
