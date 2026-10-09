'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById, updateLesson } from '@/services/lesson.service';
import { Lesson } from '@/types/lesson';
import { lessonSchema } from '@/schemas/lesson.schema';

import FormError from '@/components/ui/FormError';
import RoleGuard from '@/components/auth/RoleGuard';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';
import { getErrorMessage } from '@/utils/error';

interface Props {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

export default function EditLessonPage({ params }: Props) {
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [position, setPosition] = useState(1);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    async function loadLesson() {
      try {
        const { lessonId } = await params;

        const data = await getLessonById(Number(lessonId));

        setLesson(data);
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
        setVideoUrl(data.video_url ?? '');
        setPosition(data.position ?? 1);
      } catch (error) {
        console.error(error);

        setSubmitError('Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!lesson) return;

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

      await updateLesson(lesson.id, result.data);

      alert('Update lesson successfully');

      const { id } = await params;

      router.push(`/courses/${id}`);
    } catch (error) {
      console.error(error);
      setSubmitError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loading text="Loading lesson..." />;
  }

  if (!lesson) {
    return <ErrorState message={submitError || 'Lesson not found.'} />;
  }

  return (
    <RoleGuard allowedRoles={['admin', 'instructor']}>
      <div className="max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">Edit Lesson</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div>
            <label className="mb-2 block font-medium">Title</label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border p-3"
              placeholder="Lesson title"
            />

            <FormError message={errors.title} />
          </div>

          <div>
            <label className="mb-2 block font-medium">Description</label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border p-3"
              placeholder="Lesson description"
              rows={5}
            />

            <FormError message={errors.description} />
          </div>

          <div>
            <label className="mb-2 block font-medium">Video URL</label>

            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full rounded border p-3"
              placeholder="https://youtube.com/..."
            />

            <FormError message={errors.video_url} />
          </div>

          <div>
            <label className="mb-2 block font-medium">Position</label>

            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full rounded border p-3"
              min={1}
            />

            <FormError message={errors.position} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Lesson'}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
