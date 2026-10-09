'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';
import { getCourseById, updateCourse } from '@/services/course.service';
import { courseSchema } from '@/schemas/course.schema';
import { getErrorMessage } from '@/utils/error';

import RoleGuard from '@/components/auth/RoleGuard';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';
import FormError from '@/components/ui/FormError';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!user || !['admin', 'instructor'].includes(user.role)) return;

    let active = true;

    async function loadCourse() {
      try {
        const { id } = await params;
        const course = await getCourseById(Number(id));
        if (!active) return;
        setTitle(course.title ?? '');
        setDescription(course.description ?? '');
        setCategory(course.category ?? 'General');
        setPrice(Number(course.price ?? 0));
      } catch (cause) {
        console.error(cause);
        if (active) setError(getErrorMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      active = false;
    };
  }, [params, user, authLoading]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    const result = courseSchema.safeParse({ title, description, category, price });
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === 'string') nextErrors[field] = issue.message;
      });
      setFieldErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      const { id } = await params;
      await updateCourse(Number(id), result.data);
      router.push(`/courses/${id}`);
    } catch (cause) {
      console.error(cause);
      setError(getErrorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <Loading text="Checking your session..." />;
  if (!user || !['admin', 'instructor'].includes(user.role)) {
    return (
      <RoleGuard allowedRoles={['admin', 'instructor']}>
        <></>
      </RoleGuard>
    );
  }
  if (loading) return <Loading text="Loading course..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <RoleGuard allowedRoles={['admin', 'instructor']}>
      <div className="max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">Edit Course</h1>
        {error && <ErrorState message={error} />}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="course-title" className="mb-1 block text-sm font-medium">Course title</label>
            <input id="course-title" className="w-full rounded-lg border p-3" value={title} onChange={(event) => setTitle(event.target.value)} disabled={saving} />
            <FormError message={fieldErrors.title} />
          </div>
          <div>
            <label htmlFor="course-description" className="mb-1 block text-sm font-medium">Description</label>
            <textarea id="course-description" className="w-full rounded-lg border p-3" value={description} onChange={(event) => setDescription(event.target.value)} rows={5} disabled={saving} />
            <FormError message={fieldErrors.description} />
          </div>
          <div>
            <label htmlFor="course-category" className="mb-1 block text-sm font-medium">Category</label>
            <input id="course-category" className="w-full rounded-lg border p-3" value={category} onChange={(event) => setCategory(event.target.value)} disabled={saving} />
            <FormError message={fieldErrors.category} />
          </div>
          <div>
            <label htmlFor="course-price" className="mb-1 block text-sm font-medium">Price</label>
            <input id="course-price" type="number" min="0" className="w-full rounded-lg border p-3" value={price} onChange={(event) => setPrice(Number(event.target.value))} disabled={saving} />
            <FormError message={fieldErrors.price} />
          </div>
          <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
