'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteLesson, getLessonsByCourse } from '@/services/lesson.service';
import { getErrorMessage } from '@/utils/error';
import { Lesson } from '@/types/lesson';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
export default function LessonList({ courseId }: { courseId: number }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const data = await getLessonsByCourse(courseId);

        setLessons(data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId]);

  async function handleDelete(id: number) {
    const ok = confirm('Delete this lesson?');

    if (!ok) return;

    try {
      await deleteLesson(id);

      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson.id !== id),
      );
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <LoadingState message="Loading lessons..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

      <div className="space-y-3">
        {lessons.length === 0 ? (
          <EmptyState message="This course has no lessons yet." />
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">
                {lesson.position}. {lesson.title}
              </h3>

              <p className="mt-1 text-gray-600">{lesson.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
                  className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                >
                  View Lesson
                </Link>

                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(lesson.id)}
                  className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
