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
import FileUpload from '@/components/ui/FileUpload';

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditCoursePage({ params }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [thumbnail, setThumbnail] = useState('');
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
        setThumbnail(course.thumbnail ?? '');
        setPrice(Number(course.price ?? 0));
      } catch (cause) {
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

    const result = courseSchema.safeParse({
      title,
      description,
      category,
      thumbnail: thumbnail || null,
      price,
    });
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
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Edit Course
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
        >
          {error && <ErrorState message={error} />}

          <div>
            <label
              htmlFor="course-title"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Course Title
            </label>
            <input
              id="course-title"
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={saving}
            />
            <FormError message={fieldErrors.title} />
          </div>

          <div>
            <label
              htmlFor="course-description"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Description
            </label>
            <textarea
              id="course-description"
              className="h-32 w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              disabled={saving}
            />
            <FormError message={fieldErrors.description} />
          </div>

          {/* Thumbnail upload */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Course Thumbnail
            </label>
            <FileUpload
              type="image"
              value={thumbnail}
              onChange={(url) => setThumbnail(url)}
              placeholder="Change Course Thumbnail"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="course-category"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Category
              </label>
              <input
                id="course-category"
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                disabled={saving}
              />
              <FormError message={fieldErrors.category} />
            </div>

            <div>
              <label
                htmlFor="course-price"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Price (USD)
              </label>
              <input
                id="course-price"
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value))}
                disabled={saving}
              />
              <FormError message={fieldErrors.price} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
