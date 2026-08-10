'use client';

import { useEffect, useState } from 'react';
import { getCourseById } from '@/services/course.service';
import { Course } from '@/types/course';
import Link from 'next/link';
import { deleteCourse } from '@/services/course.service';
import { useRouter } from 'next/navigation';
import LessonList from '@/components/lesson/LessonList';
import { checkEnrollment, enrollCourse } from '@/services/enrollment.service';
interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const [course, setCourse] = useState<Course | null>(null);
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  useEffect(() => {
    async function loadCourse() {
      const { id } = await params;
      const courseId = Number(id);
      const data = await getCourseById(courseId);
      setCourse(data);
      const enrollment = await checkEnrollment(courseId);
      setEnrolled(enrollment.enrolled);
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
  async function handleEnroll() {
    if (!course) return;
    try {
      setEnrolling(true);
      await enrollCourse(course.id!);
      setEnrolled(true);
      alert('Enroll course successfully');
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Enroll course failed');
    } finally {
      setEnrolling(false);
    }
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

        {!enrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="mt-5 rounded bg-green-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Course'}
          </button>
        )}

        {enrolled && (
          <p className="mt-5 font-medium text-green-600">
            ✓ You are enrolled in this course
          </p>
        )}

        <br />

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
