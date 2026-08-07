'use client';

import { useState } from 'react';
import { createLesson } from '@/services/lesson.service';
import { useRouter } from 'next/navigation';

export default function LessonForm({ courseId }: { courseId: number }) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [position, setPosition] = useState(1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await createLesson(courseId, {
      title,
      description,
      video_url: videoUrl,
      position,
    });

    alert('Create lesson successfully');

    router.push(`/courses/${courseId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <input
        className="w-full rounded border p-3"
        placeholder="Lesson title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="w-full rounded border p-3"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full rounded border p-3"
        placeholder="Video URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      <input
        className="w-full rounded border p-3"
        type="number"
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
      />

      <button className="rounded bg-blue-600 px-5 py-2 text-white">
        Create Lesson
      </button>
    </form>
  );
}
