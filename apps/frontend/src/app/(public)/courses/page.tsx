import CourseList from '@/components/course/CourseList';

export default function CoursesPage() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
          Learn at your pace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Explore courses
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Find a course, learn from experienced instructors, and build skills that move you forward.
        </p>
      </div>

      <CourseList />
    </div>
  );
}
