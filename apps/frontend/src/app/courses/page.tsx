import CourseList from '@/components/course/CourseList';

export default function CoursesPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Courses</h1>

      <CourseList />
    </div>
  );
}
