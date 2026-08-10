'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById, updateLesson } from '@/services/lesson.service';

import { Lesson } from '@/types/lesson';

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

  useEffect(() => {
    async function loadLesson() {
      const { lessonId } = await params;

      const data = await getLessonById(Number(lessonId));

      setLesson(data);

      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
      setVideoUrl(data.video_url ?? '');
      setPosition(data.position ?? 1);

      setLoading(false);
    }

    loadLesson();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!lesson) return;

    await updateLesson(lesson.id, {
      title,
      description,
      video_url: videoUrl,
      position,
    });

    alert('Update lesson successfully');

    const { id } = await params;

    router.push(`/courses/${id}`);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!lesson) {
    return <p>Lesson not found</p>;
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-3xl font-bold">Edit Lesson</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block font-medium">Title</label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border p-3"
            placeholder="Lesson title"
          />
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
        </div>

        <button
          type="submit"
          className="rounded bg-blue-600 px-5 py-2 text-white"
        >
          Update Lesson
        </button>
      </form>
    </div>
  );
}
