'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCourse } from '@/services/course.service';
import { courseSchema } from '@/schemas/course.schema';
import FormError from '@/components/ui/FormError';
import FileUpload from '@/components/ui/FileUpload';
import { getErrorMessage } from '@/utils/error';

export default function CourseForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');
  const [thumbnail, setThumbnail] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({});
    setSubmitError('');
    setSuccessMessage('');

    const result = courseSchema.safeParse({
      title,
      description,
      category,
      thumbnail: thumbnail || null,
      price: Number(price),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (typeof field === 'string') {
          fieldErrors[field] = issue.message;
        }
      });

      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const created = await createCourse(result.data);

      setSuccessMessage('Course created successfully!');

      setTitle('');
      setDescription('');
      setCategory('General');
      setPrice('');
      setThumbnail('');

      setTimeout(() => {
        if (created?.course?.id) {
          router.push(`/courses/${created.course.id}`);
        } else {
          router.push('/courses');
        }
      }, 1200);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
    >
      {submitError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {submitError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          {successMessage}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Course Title
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Modern Fullstack Web Development"
          disabled={loading}
        />
        <FormError message={errors.title} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Description
        </label>
        <textarea
          className="h-32 w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what learners will gain from this course..."
          disabled={loading}
        />
        <FormError message={errors.description} />
      </div>

      {/* Course Thumbnail Upload */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Course Thumbnail
        </label>
        <FileUpload
          type="image"
          value={thumbnail}
          onChange={(url) => setThumbnail(url)}
          placeholder="Upload Course Thumbnail"
        />
        {errors.thumbnail && <FormError message={errors.thumbnail} />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Category
          </label>
          <input
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Programming, Design, Marketing..."
            disabled={loading}
          />
          <FormError message={errors.category} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Price (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="49.99"
            disabled={loading}
          />
          <FormError message={errors.price} />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}
