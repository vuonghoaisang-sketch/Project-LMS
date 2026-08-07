import CourseForm from '@/components/course/CourseForm';

export default function CreateCoursePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">Create Course</h1>

      <CourseForm />
    </div>
  );
}
