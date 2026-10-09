'use client';

import { useState } from 'react';
import { createCourse } from '@/services/course.service';
import { courseSchema } from '@/schemas/course.schema';
import FormError from '@/components/ui/FormError';
import { getErrorMessage } from '@/utils/error';

export default function CourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [price, setPrice] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({});
    setSubmitError('');

    const result = courseSchema.safeParse({
      title,
      description,
      category,
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

      await createCourse(result.data);

      alert('Create course successfully!');

      setTitle('');
      setDescription('');
      setCategory('General');
      setPrice('');
    } catch (error) {
      console.error(error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-5 rounded-xl border bg-white p-6 shadow"
    >
      {submitError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium">Course Title</label>

        <input
          className="w-full rounded-lg border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="React Masterclass"
          disabled={loading}
        />

        <FormError message={errors.title} />
      </div>

      <div>
        <label className="mb-2 block font-medium">Description</label>

        <textarea
          className="h-32 w-full rounded-lg border p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course description..."
          disabled={loading}
        />

        <FormError message={errors.description} />
      </div>

      <div>
        <label className="mb-2 block font-medium" htmlFor="course-category">
          Category
        </label>
        <input
          id="course-category"
          className="w-full rounded-lg border p-3"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Programming"
          disabled={loading}
        />
        <FormError message={errors.category} />
      </div>

      <div>
        <label className="mb-2 block font-medium">Price</label>

        <input
          type="number"
          min="0"
          className="w-full rounded-lg border p-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="99"
          disabled={loading}
        />

        <FormError message={errors.price} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}
