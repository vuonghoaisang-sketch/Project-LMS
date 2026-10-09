'use client';

import { useEffect, useState } from 'react';

import { getCourseProgress } from '@/services/learning-progress.service';
import { CourseProgress as CourseProgressData } from '@/types/learning-progress';
import { getErrorMessage } from '@/utils/error';

export default function CourseProgress({ courseId }: { courseId: number }) {
  const [progress, setProgress] = useState<CourseProgressData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getCourseProgress(courseId)
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(getErrorMessage(cause));
      });

    return () => {
      active = false;
    };
  }, [courseId]);

  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="mt-6 rounded-xl bg-slate-50 p-4">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-800">Your progress</span>
        <span className="text-slate-600" aria-live="polite">
          {progress
            ? `${progress.completedLessons} of ${progress.totalLessons} lessons · ${progress.progressPercent}%`
            : 'Loading progress...'}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-label="Course completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress?.progressPercent ?? 0}
      >
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${progress?.progressPercent ?? 0}%` }}
        />
      </div>
    </div>
  );
}
