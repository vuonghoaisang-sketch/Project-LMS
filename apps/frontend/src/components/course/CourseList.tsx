'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '@/services/course.service';
import CourseCard from './CourseCard';
import { Course } from '@/types/course';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

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
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return <Loading text="Loading courses..." />;
  }

  if (error) {
    return <ErrorState description={error} />;
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="There are no courses available at the moment."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
