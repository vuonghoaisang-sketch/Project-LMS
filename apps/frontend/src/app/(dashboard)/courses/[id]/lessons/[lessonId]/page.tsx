'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById } from '@/services/lesson.service';
import { checkEnrollment } from '@/services/enrollment.service';
import { Lesson } from '@/types/lesson';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

interface Props {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

export default function LessonDetailPage({ params }: Props) {
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    async function loadLesson() {
      try {
        setLoading(true);
        setError('');

        const { id, lessonId } = await params;

        const courseIdNumber = Number(id);
        const lessonIdNumber = Number(lessonId);

        setCourseId(courseIdNumber);

        const enrollment = await checkEnrollment(courseIdNumber);

        if (!enrollment.enrolled) {
          setHasAccess(false);
          return;
        }

        const data = await getLessonById(lessonIdNumber);

        setLesson(data);
        setHasAccess(true);
      } catch (error: any) {
        console.error(error);

        setError(
          error?.response?.data?.message ||
            'Something went wrong while loading the lesson.',
        );
      } finally {
        setLoading(false);
      }
    }

    loadLesson();
  }, [params]);

  if (loading) {
    return <Loading text="Loading lesson..." fullScreen />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load lesson"
        description={error}
        action={
          <button
            onClick={() => router.back()}
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Go Back
          </button>
        }
      />
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-2xl rounded-xl border p-8">
        <h1 className="text-2xl font-bold">
          You need to enroll in this course first.
        </h1>

        <p className="mt-3 text-gray-600">
          Please enroll in this course before watching its lessons.
        </p>

        <button
          onClick={() => {
            if (courseId) {
              router.push(`/courses/${courseId}`);
            }
          }}
          className="mt-6 rounded bg-green-600 px-5 py-2 text-white"
        >
          Go to Course
        </button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <EmptyState
        title="Lesson not found"
        description="The lesson you're looking for does not exist."
        action={
          <button
            onClick={() => router.back()}
            className="rounded bg-gray-800 px-4 py-2 text-white"
          >
            Go Back
          </button>
        }
      />
    );
  }

  function getYoutubeEmbedUrl(url: string | null) {
    if (!url) return null;

    try {
      const parsedUrl = new URL(url);

      let videoId = '';

      if (parsedUrl.hostname.includes('youtube.com')) {
        videoId = parsedUrl.searchParams.get('v') || '';
      }

      if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1);
      }

      if (!videoId) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  }

  const videoUrl = getYoutubeEmbedUrl(lesson.video_url);

  return (
    <div className="max-w-5xl">
      <button
        onClick={() => {
          if (courseId) {
            router.push(`/courses/${courseId}`);
          }
        }}
        className="mb-6 rounded border px-4 py-2"
      >
        ← Back to Course
      </button>

      <div className="mb-6">
        <p className="text-sm text-gray-500">Lesson {lesson.position}</p>

        <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>
      </div>

      {videoUrl ? (
        <div className="overflow-hidden rounded-xl bg-black">
          <div className="aspect-video">
            <iframe
              src={videoUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border p-10 text-center">
          <p className="text-gray-500">No video available</p>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold">Description</h2>

        <p className="mt-3 whitespace-pre-line text-gray-600">
          {lesson.description || 'No description available.'}
        </p>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={() => {
            if (courseId) {
              router.push(`/courses/${courseId}/lessons/${lesson.id}/edit`);
            }
          }}
          className="rounded bg-blue-600 px-5 py-2 text-white"
        >
          Edit Lesson
        </button>

        <button
          onClick={() => {
            if (courseId) {
              router.push(`/courses/${courseId}`);
            }
          }}
          className="rounded border px-5 py-2"
        >
          Course Details
        </button>
      </div>
    </div>
  );
}
