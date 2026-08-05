import { Course } from '@/types/course';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">
      <h2 className="text-xl font-bold">{course.title}</h2>

      <p className="mt-2 text-gray-600">{course.description}</p>

      <p className="mt-3">
        Instructor:
        <span className="font-semibold"> {course.instructor_name}</span>
      </p>

      <p className="mt-2 font-bold text-blue-600">${course.price}</p>
    </div>
  );
}
