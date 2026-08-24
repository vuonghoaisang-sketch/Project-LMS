'use client';

import { useState } from 'react';
import { createLesson } from '@/services/lesson.service';
import { useRouter } from 'next/navigation';

import { lessonSchema } from '@/schemas/lesson.schema';
import FormError from '@/components/ui/FormError';

export default function LessonForm({ courseId }: { courseId: number }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [position, setPosition] = useState(1);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrors({});
    setSubmitError('');

    const result = lessonSchema.safeParse({
      title,
      description,
      video_url: videoUrl,
      position,
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

      await createLesson(courseId, result.data);

      alert('Create lesson successfully');

      router.push(`/courses/${courseId}`);
    } catch (error: any) {
      console.error(error);

      setSubmitError(
        error?.response?.data?.message || 'Failed to create lesson',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      {submitError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <div>
        <label className="mb-2 block font-medium">Lesson Title</label>

        <input
          className="w-full rounded border p-3"
          placeholder="Lesson title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />

        <FormError message={errors.title} />
      </div>

      <div>
        <label className="mb-2 block font-medium">Description</label>

        <textarea
          className="w-full rounded border p-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />

        <FormError message={errors.description} />
      </div>

      <div>
        <label className="mb-2 block font-medium">Video URL</label>

        <input
          className="w-full rounded border p-3"
          placeholder="https://youtube.com/..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          disabled={loading}
        />

        <FormError message={errors.video_url} />
      </div>

      <div>
        <label className="mb-2 block font-medium">Position</label>

        <input
          className="w-full rounded border p-3"
          type="number"
          min="1"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
          disabled={loading}
        />

        <FormError message={errors.position} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Lesson'}
      </button>
    </form>
  );
}
