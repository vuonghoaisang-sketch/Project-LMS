'use client';

import { useEffect, useState } from 'react';
import { getCourseById, deleteCourse } from '@/services/course.service';
import { Course } from '@/types/course';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LessonList from '@/components/lesson/LessonList';
import { checkEnrollment, enrollCourse } from '@/services/enrollment.service';
import { useAuth } from '@/context/AuthContext';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function loadCourse() {
      try {
        setLoading(true);
        setError('');

        const { id } = await params;
        const courseId = Number(id);

        const data = await getCourseById(courseId);
        setCourse(data);

        if (user?.role === 'student') {
          const enrollment = await checkEnrollment(courseId);
          setEnrolled(enrollment.enrolled);
        } else {
          setEnrolled(true);
        }
      } catch (error: any) {
        console.error(error);

        setError(error?.response?.data?.message || 'Failed to load course.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params, user, authLoading]);

  async function handleDelete() {
    if (!course) return;

    const confirmDelete = confirm(
      'Are you sure you want to delete this course?',
    );

    if (!confirmDelete) return;

    try {
      await deleteCourse(course.id!);

      alert('Delete successfully');

      router.push('/courses');
    } catch (error: any) {
      console.error(error);

      alert(error?.response?.data?.message || 'Delete course failed');
    }
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

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-600">Something went wrong</h1>

        <p className="mt-2 text-red-500">{error}</p>

        <button
          onClick={() => router.back()}
          className="mt-5 rounded bg-gray-800 px-4 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <p>Course not found.</p>
      </div>
    );
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

        {user?.role === 'student' && !enrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="mt-5 rounded bg-green-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {enrolling ? 'Enrolling...' : 'Enroll Course'}
          </button>
        )}

        {user?.role === 'student' && enrolled && (
          <p className="mt-5 font-medium text-green-600">
            ✓ You are enrolled in this course
          </p>
        )}

        <br />

        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <>
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
          </>
        )}
      </div>

      <LessonList courseId={course.id!} />

      {(user?.role === 'admin' || user?.role === 'instructor') && (
        <Link
          href={`/courses/${course.id}/lessons/create`}
          className="mt-5 inline-block rounded bg-green-600 px-5 py-2 text-white"
        >
          + Add Lesson
        </Link>
      )}
    </div>
  );
}
