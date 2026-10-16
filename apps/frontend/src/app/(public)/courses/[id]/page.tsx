'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { getCourseById, deleteCourse } from '@/services/course.service';
import { checkEnrollment, enrollCourse } from '@/services/enrollment.service';
import { getCourseProgress } from '@/services/learning-progress.service';

import { Course } from '@/types/course';
import { useAuth } from '@/context/AuthContext';

import LessonList from '@/components/lesson/LessonList';
import CourseProgress from '@/components/course/CourseProgress';
import CourseReviews from '@/components/course/CourseReviews';
import CourseCertificate from '@/components/course/CourseCertificate';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

import { getErrorMessage } from '@/utils/error';
import { formatPrice } from '@/utils/format';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const fromMyCourses = searchParams.get('from') === 'my-courses';

  const backUrl = fromMyCourses ? '/my-courses' : '/courses';

  const backText = fromMyCourses ? '← Back to My Courses' : '← Back to Courses';

  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
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

          if (enrollment.enrolled) {
            const prog = await getCourseProgress(courseId);
            setProgressPercent(prog.progressPercent);
          }
        } else {
          setEnrolled(false);
        }
      } catch (err) {
        setError(getErrorMessage(err));
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
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  async function handleEnroll() {
    if (!course) return;

    // Khoá học có giá: chuyển sang trang thanh toán
    if (Number(course.price) > 0) {
      router.push(`/checkout/course/${course.id}`);
      return;
    }

    // Khoá học miễn phí: ghi danh trực tiếp
    try {
      setEnrolling(true);
      await enrollCourse(course.id!);
      setEnrolled(true);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  }

  if (authLoading || loading) {
    return <Loading text="Loading course..." />;
  }

  if (error || !course) {
    return (
      <div className="max-w-xl">
        <ErrorState message={error || 'Course not found.'} />
        <Link
          href={backUrl}
          className="mt-5 inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          {backText}
        </Link>
      </div>
    );
  }

  const canManageCourse =
    user?.role === 'admin' ||
    (user?.role === 'instructor' && course.created_by === user.id);

  const isPaidCourse = Number(course.price) > 0;

  return (
    <div className="max-w-5xl space-y-8">
      <Link
        href={backUrl}
        className="inline-block rounded border px-4 py-2 text-sm font-medium hover:bg-gray-50"
      >
        {backText}
      </Link>

      {/* Course Banner */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {course.thumbnail && (
          <div
            className="h-56 w-full bg-slate-900 bg-cover bg-center sm:h-72"
            style={{ backgroundImage: `url("${course.thumbnail}")` }}
          />
        )}
        <div className="p-6 sm:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {course.category || 'General'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-4 leading-7 text-slate-600">{course.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-6 border-t pt-4 text-sm text-slate-700">
            <div>
              <strong>Instructor:</strong>{' '}
              {course.instructor_name || 'LMS Instructor'}
            </div>
            <div>
              <strong>Price:</strong> {formatPrice(course.price)}
            </div>
          </div>

          {user?.role === 'student' && (
            <div className="mt-6">
              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {enrolling
                    ? 'Enrolling...'
                    : isPaidCourse
                      ? `Buy now - ${formatPrice(course.price)}`
                      : 'Enroll for free'}
                </button>
              ) : (
                <div className="inline-block rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                  ✓ You are enrolled in this course
                </div>
              )}
            </div>
          )}

          {user?.role === 'student' && enrolled && (
            <div className="mt-6">
              <CourseProgress courseId={course.id} />
            </div>
          )}

          {canManageCourse && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/courses/${course.id}/edit`}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-700"
              >
                Edit Course
              </Link>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-red-700"
              >
                Delete Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Certificate Claim Section (When 100% completed) */}
      {user?.role === 'student' && enrolled && (
        <CourseCertificate
          courseId={course.id}
          progressPercent={progressPercent}
        />
      )}

      {/* Lessons Curriculum List */}
      {canManageCourse || enrolled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Curriculum Lessons
            </h2>
            {canManageCourse && (
              <Link
                href={`/courses/${course.id}/lessons/create`}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow transition hover:bg-blue-700"
              >
                + Add Lesson
              </Link>
            )}
          </div>
          <LessonList courseId={course.id} canManage={canManageCourse} />
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border bg-white p-8">
          <h2 className="mb-3 text-2xl font-bold">Course Lessons</h2>
          <EmptyState
            title={
              user ? 'Enroll to unlock lessons' : 'Sign in to view lessons'
            }
            description={
              user
                ? 'Enroll in this course to access lessons, videos, quizzes, and materials.'
                : 'Sign in to your account and enroll to unlock full course lessons.'
            }
            action={
              !user ? (
                <Link
                  href="/login"
                  className="inline-flex rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
                >
                  Sign in
                </Link>
              ) : undefined
            }
          />
        </div>
      )}

      {/* Ratings and Reviews Section */}
      <CourseReviews
        courseId={course.id}
        userProgressPercent={progressPercent}
        isEnrolled={enrolled}
      />
    </div>
  );
}
