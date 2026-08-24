'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getMyEnrollments } from '@/services/enrollment.service';
import { Enrollment } from '@/types/enrollment';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError('');

        const data = await getMyEnrollments();

        setCourses(data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return <Loading text="Loading your courses..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (courses.length === 0) {
    return <EmptyState message="You haven't enrolled in any course yet." />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My Courses</h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">{course.title}</h2>

            <p className="mt-2 text-gray-600">{course.description}</p>

            <p className="mt-3 text-sm text-gray-500">
              Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
            </p>

            <Link
              href={`/courses/${course.course_id}`}
              className="mt-5 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Course
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
