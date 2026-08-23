'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteLesson, getLessonsByCourse } from '@/services/lesson.service';
import { Lesson } from '@/types/lesson';
import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

export default function LessonList({ courseId }: { courseId: number }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadLessons() {
      try {
        setLoading(true);
        setError('');

        const data = await getLessonsByCourse(courseId);

        setLessons(data);
      } catch (error) {
        console.error(error);
        setError('Failed to load lessons.');
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
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
      alert('Delete lesson failed');
    }
  }

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <Loading text="Loading lessons..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <ErrorState description={error} />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <EmptyState
          title="No lessons yet"
          description="This course doesn't have any lessons yet."
        />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

      <div className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="rounded border p-4">
            <h3 className="font-semibold">
              {lesson.position}. {lesson.title}
            </h3>

            <p className="text-gray-600">{lesson.description}</p>

            <Link
              href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
              className="mt-3 mr-2 inline-block rounded bg-green-600 px-3 py-1 text-white"
            >
              View Lesson
            </Link>

            <Link
              href={`/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
              className="mt-3 mr-2 inline-block rounded bg-blue-600 px-3 py-1 text-white"
            >
              Edit
            </Link>

            <button
              onClick={() => handleDelete(lesson.id)}
              className="mt-3 rounded bg-red-600 px-3 py-1 text-white"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
