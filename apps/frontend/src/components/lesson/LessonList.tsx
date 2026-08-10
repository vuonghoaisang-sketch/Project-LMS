'use client';

import { useEffect, useState } from 'react';
import { deleteLesson } from '@/services/lesson.service';
import { getLessonsByCourse } from '@/services/lesson.service';
import Link from 'next/link';
import { Lesson } from '@/types/lesson';

export default function LessonList({ courseId }: { courseId: number }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getLessonsByCourse(courseId);
      setLessons(data);
    }
    load();
  }, [courseId]);

  async function handleDelete(id: number) {
    const ok = confirm('Delete this lesson?');
    if (!ok) return;
    await deleteLesson(id);
    window.location.reload();
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
