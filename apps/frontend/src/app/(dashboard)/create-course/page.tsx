import RoleGuard from '@/components/auth/RoleGuard';
import CourseForm from '@/components/course/CourseForm';

export default function CreateCoursePage() {
  return (
    <RoleGuard allowedRoles={['admin', 'instructor']}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold">Create Course</h1>

        <CourseForm />
      </div>
    </RoleGuard>
  );
}
