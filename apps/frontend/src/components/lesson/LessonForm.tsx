'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLesson } from '@/services/lesson.service';
import { addLessonAttachment } from '@/services/upload.service';
import { lessonSchema } from '@/schemas/lesson.schema';
import FormError from '@/components/ui/FormError';
import FileUpload from '@/components/ui/FileUpload';
import { getErrorMessage } from '@/utils/error';

interface AttachedFile {
  name: string;
  file_url: string;
  file_size: number;
  file_type: string;
}

export default function LessonForm({ courseId }: { courseId: number }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoType, setVideoType] = useState<'embed' | 'upload'>('embed');
  const [videoUrl, setVideoUrl] = useState('');
  const [position, setPosition] = useState(1);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function handleAttachmentUploaded(
    url: string,
    info?: { name: string; size: number; type: string },
  ) {
    if (!url) return;
    const newAttachment: AttachedFile = {
      name: info?.name || url.split('/').pop() || 'Attachment',
      file_url: url,
      file_size: info?.size || 0,
      file_type: info?.type || 'application/octet-stream',
    };
    setAttachments((prev) => [...prev, newAttachment]);
  }

  function handleRemoveAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      setLoading(true);

      const created = await createLesson(courseId, result.data);
      const lessonId = created?.lesson?.id || created?.id;

      // Save attachments if any
      if (lessonId && attachments.length > 0) {
        for (const att of attachments) {
          try {
            await addLessonAttachment(lessonId, att);
          } catch (attErr) {
            console.warn('Failed to save attachment:', attErr);
          }
        }
      }

      setSuccessMessage('Lesson created successfully!');

      setTimeout(() => {
        router.push(`/courses/${courseId}`);
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
          Lesson Title
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="e.g. Introduction to React Components"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <FormError message={errors.title} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Description
        </label>
        <textarea
          className="h-28 w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
          placeholder="Lesson overview, key topics, and takeaways..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
        <FormError message={errors.description} />
      </div>

      {/* Video Source Selection */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
        <label className="block text-sm font-semibold text-slate-800">
          Video Source
        </label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="video_type"
              checked={videoType === 'embed'}
              onChange={() => {
                setVideoType('embed');
                setVideoUrl('');
              }}
              className="text-blue-600"
            />
            <span>Embed Link (YouTube / Vimeo)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="radio"
              name="video_type"
              checked={videoType === 'upload'}
              onChange={() => {
                setVideoType('upload');
                setVideoUrl('');
              }}
              className="text-blue-600"
            />
            <span>Upload Video (MP4 / WebM)</span>
          </label>
        </div>

        {videoType === 'embed' ? (
          <div>
            <input
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              disabled={loading}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Paste an unlisted/public YouTube link or Vimeo URL.
            </p>
          </div>
        ) : (
          <div>
            <FileUpload
              type="video"
              value={videoUrl}
              onChange={(url) => setVideoUrl(url)}
              placeholder="Upload Video File (MP4, WebM)"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Supports MP4, WebM, MOV. Video will be streamed securely.
            </p>
          </div>
        )}

        <FormError message={errors.video_url} />
      </div>

      {/* Lesson Attachments */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-800">
          Lesson Attachments (Slides, Code, Documents)
        </label>
        <p className="text-xs text-slate-500">
          Upload PDF lecture slides, sample code ZIP, or documents for students to download.
        </p>

        <FileUpload
          type="attachment"
          onChange={handleAttachmentUploaded}
          placeholder="Attach File (.pdf, .zip, .docx...)"
        />

        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold text-slate-700">📎 {att.name}</span>
                  {att.file_size > 0 && (
                    <span className="text-slate-400">
                      ({(att.file_size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="text-red-500 hover:text-red-700 font-bold ml-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-800">
          Lesson Order / Position
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
        className="w-full sm:w-auto rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Lesson'}
      </button>
    </form>
  );
}
