'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getCourseById, deleteCourse } from '@/services/course.service';

import { checkEnrollment, enrollCourse } from '@/services/enrollment.service';

import { Course } from '@/types/course';
import { useAuth } from '@/context/AuthContext';

import LessonList from '@/components/lesson/LessonList';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';

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

        /*
         * Student phải kiểm tra enrollment.
         *
         * Admin và Instructor không cần enrollment
         * để xem course.
         */
        if (user?.role === 'student') {
          const enrollment = await checkEnrollment(courseId);

          setEnrolled(enrollment.enrolled);
        } else {
          setEnrolled(true);
        }
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
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

      alert('Delete course successfully');

      router.push('/courses');
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  async function handleEnroll() {
    if (!course) return;

    try {
      setEnrolling(true);

      await enrollCourse(course.id!);

      setEnrolled(true);

      alert('Enroll course successfully');
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    } finally {
      setEnrolling(false);
    }
  }

  // Auth đang loading
  if (authLoading) {
    return <Loading text="Loading user..." />;
  }

  // Course đang loading
  if (loading) {
    return <Loading text="Loading course..." />;
  }

  // Có lỗi
  if (error) {
    return (
      <div className="max-w-xl">
        <ErrorState message={error} />

        <Link
          href="/courses"
          className="mt-5 inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  // Không tìm thấy course
  if (!course) {
    return (
      <div className="max-w-xl">
        <ErrorState message="Course not found." />

        <Link
          href="/courses"
          className="mt-5 inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <Link
        href="/courses"
        className="mb-6 inline-block rounded border px-4 py-2 hover:bg-gray-50"
      >
        ← Back to Courses
      </Link>

      {/* Course information */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{course.title}</h1>

        <p className="mt-4 leading-7 text-gray-600">{course.description}</p>

        <div className="mt-6 space-y-2">
          <p>
            <strong>Instructor:</strong> {course.instructor_name}
          </p>

          <p>
            <strong>Price:</strong> ${course.price}
          </p>
        </div>

        {/* Student actions */}
        {user?.role === 'student' && (
          <div className="mt-6">
            {!enrolled ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Course'}
              </button>
            ) : (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">
                ✓ You are enrolled in this course
              </div>
            )}
          </div>
        )}

        {/* Admin / Instructor actions */}
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/courses/${course.id}/edit`}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
            >
              Edit Course
            </Link>

            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700"
            >
              Delete Course
            </button>
          </div>
        )}
      </div>

      {/* Lessons */}
      <LessonList courseId={course.id!} />

      {/* Add Lesson */}
      {(user?.role === 'admin' || user?.role === 'instructor') && (
        <Link
          href={`/courses/${course.id}/lessons/create`}
          className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
        >
          + Add Lesson
        </Link>
      )}
    </div>
  );
}
