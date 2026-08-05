'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '@/services/course.service';
import CourseCard from './CourseCard';
import { Course } from '@/types/course';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
