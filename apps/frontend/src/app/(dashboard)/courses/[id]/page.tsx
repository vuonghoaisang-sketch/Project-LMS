'use client';

import { useEffect, useState } from 'react';
import { getCourseById } from '@/services/course.service';
import { Course } from '@/types/course';
import Link from 'next/link';
import { deleteCourse } from '@/services/course.service';
import { useRouter } from 'next/navigation';
import LessonList from '@/components/lesson/LessonList';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const router = useRouter();
  useEffect(() => {
    async function loadCourse() {
      const { id } = await params;
      const data = await getCourseById(Number(id));
      setCourse(data);
    }

    loadCourse();
  }, [params]);

  if (!course) {
    return <p>Loading...</p>;
  }

  async function handleDelete() {
    if (!course) return;
    const confirmDelete = confirm('Are you sure delete this course?');
    if (!confirmDelete) return;
    await deleteCourse(course.id!);
    alert('Delete successfully');
    router.push('/courses');
  }
  return (
    <div>
      <h1 className="text-3xl font-bold">{course.title}</h1>

      <p className="mt-6 text-gray-600">{course.description}</p>

      <div className="mt-8 space-y-2">
        <p>
          <strong>Instructor:</strong> {course.instructor_name}
        </p>

        <p>
          <strong>Price:</strong> ${course.price}
        </p>

        <Link
          href={`/courses/${course.id}/edit`}
          className="mt-5 inline-block rounded bg-blue-600 px-5 py-2 text-white"
        >
          Edit Course
        </Link>

        <button
          onClick={handleDelete}
          className="mt-5 ml-3 rounded bg-red-600 px-5 py-2 text-white"
        >
          Delete Course
        </button>
      </div>

      {/* Lesson List */}
      <LessonList courseId={course.id} />
      <Link
        href={`/courses/${course.id}/lessons/create`}
        className="mt-5 inline-block rounded bg-green-600 px-5 py-2 text-white"
      >
        + Add Lesson
      </Link>
    </div>
  );
}
