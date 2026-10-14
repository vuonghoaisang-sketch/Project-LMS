'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById, updateLesson } from '@/services/lesson.service';
import {
  addLessonAttachment,
  deleteLessonAttachment,
} from '@/services/upload.service';
import { Lesson } from '@/types/lesson';
import { LessonAttachment } from '@/types/attachment';
import { lessonSchema } from '@/schemas/lesson.schema';

import FormError from '@/components/ui/FormError';
import RoleGuard from '@/components/auth/RoleGuard';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';
import FileUpload from '@/components/ui/FileUpload';
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
  const [videoType, setVideoType] = useState<'embed' | 'upload'>('embed');
  const [videoUrl, setVideoUrl] = useState('');
  const [position, setPosition] = useState(1);
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadLesson() {
      try {
        const { lessonId } = await params;

        const data = await getLessonById(Number(lessonId));

        setLesson(data);
        setTitle(data.title ?? '');
        setDescription(data.description ?? '');
        setVideoType(data.video_type || (data.video_url?.includes('/uploads/') ? 'upload' : 'embed'));
        setVideoUrl(data.video_url ?? '');
        setPosition(data.position ?? 1);
        setAttachments(data.attachments || []);
      } catch (error) {
        setSubmitError('Failed to load lesson.');
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [params]);

  async function handleAttachmentUploaded(
    url: string,
    info?: { name: string; size: number; type: string },
  ) {
    if (!url || !lesson) return;
    try {
      const res = await addLessonAttachment(lesson.id, {
        name: info?.name || url.split('/').pop() || 'Attachment',
        file_url: url,
        file_size: info?.size || 0,
        file_type: info?.type || 'application/octet-stream',
      });
      setAttachments((prev) => [...prev, res.attachment]);
    } catch (err) {
      console.warn('Failed to upload attachment:', err);
    }
  }

  async function handleDeleteAttachment(attachmentId: number) {
    try {
      await deleteLessonAttachment(attachmentId);
      setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
    } catch (err) {
      console.warn('Failed to delete attachment:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!lesson) return;

    setErrors({});
    setSubmitError('');
    setSuccessMessage('');

    const result = lessonSchema.safeParse({
      title,
      description,
      video_type: videoType,
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
      setSubmitting(true);

      await updateLesson(lesson.id, result.data);

      setSuccessMessage('Lesson updated successfully!');

      const { id } = await params;

      setTimeout(() => {
        router.push(`/courses/${id}/lessons/${lesson.id}`);
      }, 1200);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
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
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Edit Lesson: {lesson.title}
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
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
              Lesson Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Lesson title"
              disabled={submitting}
            />
            <FormError message={errors.title} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-32 w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Lesson description"
              disabled={submitting}
            />
            <FormError message={errors.description} />
          </div>

          {/* Video Source */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-800">
              Video Source
            </label>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="video_type_edit"
                  checked={videoType === 'embed'}
                  onChange={() => setVideoType('embed')}
                  className="text-blue-600"
                />
                <span>Embed Link (YouTube / Vimeo)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                <input
                  type="radio"
                  name="video_type_edit"
                  checked={videoType === 'upload'}
                  onChange={() => setVideoType('upload')}
                  className="text-blue-600"
                />
                <span>Upload Video (MP4 / WebM)</span>
              </label>
            </div>

            {videoType === 'embed' ? (
              <div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="https://youtube.com/..."
                  disabled={submitting}
                />
              </div>
            ) : (
              <div>
                <FileUpload
                  type="video"
                  value={videoUrl}
                  onChange={(url) => setVideoUrl(url)}
                  placeholder="Upload New Video"
                />
              </div>
            )}

            <FormError message={errors.video_url} />
          </div>

          {/* Attachments */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <label className="block text-sm font-semibold text-slate-800">
              Downloadable Attachments
            </label>

            <FileUpload
              type="attachment"
              onChange={handleAttachmentUploaded}
              placeholder="Add New Attachment (.pdf, .zip, .docx...)"
            />

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700 truncate">
                      📎 {att.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(att.id)}
                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              Position
            </label>
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              min={1}
              disabled={submitting}
            />
            <FormError message={errors.position} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
