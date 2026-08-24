'use client';

import { useEffect, useState } from 'react';

import { getCourses } from '@/services/course.service';
import { getErrorMessage } from '@/utils/error';

import CourseCard from './CourseCard';

import { Course } from '@/types/course';

import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError('');

        const data = await getCourses();

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
    return <LoadingState message="Loading courses..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (courses.length === 0) {
    return <EmptyState message="No courses available." />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
