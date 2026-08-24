'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { deleteLesson, getLessonsByCourse } from '@/services/lesson.service';

import { Lesson } from '@/types/lesson';
import { useAuth } from '@/context/AuthContext';

interface Props {
  courseId: number;
}

export default function LessonList({ courseId }: Props) {
  const { user, loading: authLoading } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function loadLessons() {
      try {
        setLoading(true);
        setError('');

        const data = await getLessonsByCourse(courseId);

        setLessons(data);
      } catch (error: any) {
        console.error(error);

        setError(error?.response?.data?.message || 'Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [courseId, authLoading]);

  async function handleDelete(id: number) {
    const ok = confirm('Are you sure you want to delete this lesson?');

    if (!ok) return;

    try {
      await deleteLesson(id);

      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson.id !== id),
      );
    } catch (error: any) {
      console.error(error);

      alert(error?.response?.data?.message || 'Delete lesson failed.');
    }
  }

  const canManageLessons =
    user?.role === 'admin' || user?.role === 'instructor';

  if (authLoading || loading) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <p className="text-gray-500">Loading lessons...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-bold text-red-600">Something went wrong</h2>

        <p className="mt-2 text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

      {lessons.length === 0 ? (
        <div className="rounded-xl border p-6 text-center">
          <p className="text-gray-500">No lessons available for this course.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-xl border p-4">
              <h3 className="font-semibold">
                {lesson.position}. {lesson.title}
              </h3>

              <p className="mt-1 text-gray-600">{lesson.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
                  className="rounded bg-green-600 px-3 py-1 text-white"
                >
                  View Lesson
                </Link>

                {canManageLessons && (
                  <>
                    <Link
                      href={`/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => handleDelete(lesson.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
