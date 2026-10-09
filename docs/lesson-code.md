# Lesson code tổng hợp

Các file dưới đây được trích từ source hiện có. File validator được ghi rõ nếu không tồn tại.

## `apps/frontend/src/components/lesson/LessonList.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteLesson, getLessonsByCourse } from '@/services/lesson.service';
import { getErrorMessage } from '@/utils/error';
import { Lesson } from '@/types/lesson';
import LoadingState from '@/components/ui/LoadingState';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
export default function LessonList({ courseId }: { courseId: number }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError('');

        const data = await getLessonsByCourse(courseId);

        setLessons(data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [courseId]);

  async function handleDelete(id: number) {
    const ok = confirm('Delete this lesson?');

    if (!ok) return;

    try {
      await deleteLesson(id);

      setLessons((currentLessons) =>
        currentLessons.filter((lesson) => lesson.id !== id),
      );
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <LoadingState message="Loading lessons..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

        <ErrorState message={error} />
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="mb-5 text-2xl font-bold">Lessons</h2>

      <div className="space-y-3">
        {lessons.length === 0 ? (
          <EmptyState message="This course has no lessons yet." />
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-lg border p-4">
              <h3 className="font-semibold">
                {lesson.position}. {lesson.title}
              </h3>

              <p className="mt-1 text-gray-600">{lesson.description}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}`}
                  className="rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                >
                  View Lesson
                </Link>

                <Link
                  href={`/courses/${lesson.course_id}/lessons/${lesson.id}/edit`}
                  className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(lesson.id)}
                  className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

## `apps/frontend/src/app/(dashboard)/courses/[id]/lessons/create/page.tsx`

```tsx
import RoleGuard from '@/components/auth/RoleGuard';
import LessonForm from '@/components/lesson/LessonForm';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CreateLessonPage({ params }: Props) {
  const { id } = await params;

  return (
    <RoleGuard allowedRoles={['admin', 'instructor']}>
      <div>
        <h1 className="mb-6 text-3xl font-bold">Create Lesson</h1>

        <LessonForm courseId={Number(id)} />
      </div>
    </RoleGuard>
  );
}
```

## `apps/frontend/src/app/(dashboard)/courses/[id]/lessons/[lessonId]/edit/page.tsx`

```tsx
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
    } catch (error: any) {
      console.error(error);

      setSubmitError(
        error?.response?.data?.message || 'Failed to update lesson',
      );
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
```

## `apps/frontend/src/app/(dashboard)/courses/[id]/lessons/[lessonId]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getLessonById } from '@/services/lesson.service';
import { checkEnrollment } from '@/services/enrollment.service';

import { Lesson } from '@/types/lesson';

import { useAuth } from '@/context/AuthContext';

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

  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const [error, setError] = useState('');

  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;

    async function loadLesson() {
      try {
        setLoading(true);
        setError('');

        const { id, lessonId } = await params;

        const courseIdNumber = Number(id);
        const lessonIdNumber = Number(lessonId);

        setCourseId(courseIdNumber);

        /*
         * Admin và Instructor
         * được xem lesson mà không cần enrollment.
         */
        if (user?.role === 'admin' || user?.role === 'instructor') {
          setHasAccess(true);
        } else {
          /*
           * Student phải enroll course
           * mới được xem lesson.
           */
          const enrollment = await checkEnrollment(courseIdNumber);

          if (!enrollment.enrolled) {
            setHasAccess(false);
            return;
          }

          setHasAccess(true);
        }

        const data = await getLessonById(lessonIdNumber);

        setLesson(data);
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
  }, [params, user, authLoading]);

  if (authLoading) {
    return <Loading text="Loading user..." fullScreen />;
  }

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
        className="mb-6 rounded border px-4 py-2 hover:bg-gray-50"
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

      {(user?.role === 'admin' || user?.role === 'instructor') && (
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              if (courseId) {
                router.push(`/courses/${courseId}/lessons/${lesson.id}/edit`);
              }
            }}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
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
      )}
    </div>
  );
}
```

## `apps/frontend/src/services/lesson.service.ts`

```ts
import api from '@/lib/axios';

export async function getLessonsByCourse(courseId: number) {
  const response = await api.get(`/courses/${courseId}/lessons`);

  return response.data.lessons;
}

export async function getLessonById(id: number) {
  const response = await api.get(`/lessons/${id}`);

  return response.data.lesson;
}

export async function createLesson(
  courseId: number,
  data: {
    title: string;
    description: string;
    video_url: string;
    position: number;
  },
) {
  const token = localStorage.getItem('token');

  const response = await api.post(`/courses/${courseId}/lessons`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function updateLesson(
  id: number,
  data: {
    title: string;
    description: string;
    video_url: string;
    position: number;
  },
) {
  const token = localStorage.getItem('token');

  const response = await api.put(`/lessons/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function deleteLesson(id: number) {
  const token = localStorage.getItem('token');

  const response = await api.delete(`/lessons/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}
```

## `apps/frontend/src/types/lesson.ts`

```ts
export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  video_url: string | null;
  position: number;
}
```

## `apps/backend/src/routes/lesson.route.ts`

```ts
import { Router } from "express";

import {
  createLessonController,
  getLessonsController,
  getLessonController,
  updateLessonController,
  deleteLessonController,
} from "../controllers/lesson.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

import {
  requireCourseOwner,
  requireLessonOwner,
} from "../middlewares/ownership.middleware";

import { requireCourseEnrollment } from "../middlewares/course-access.middleware";
import { requireLessonEnrollment } from "../middlewares/enrollment.middleware";

const router = Router();

router.post(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  createLessonController,
);

router.get(
  "/courses/:courseId/lessons",
  authMiddleware,
  requireCourseEnrollment,
  getLessonsController,
);

router.get(
  "/lessons/:id",
  authMiddleware,
  requireLessonEnrollment,
  getLessonController,
);

router.put(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  updateLessonController,
);

router.delete(
  "/lessons/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireLessonOwner,
  deleteLessonController,
);

export default router;
```

## `apps/backend/src/controllers/lesson.controller.ts`

```ts
import { Request, Response } from "express";

import {
  createLessonService,
  getLessonsService,
  getLessonService,
  updateLessonService,
  deleteLessonService,
} from "../services/lesson.service";

import { validateLessonInput } from "../validators/lesson.validator";

export async function createLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lesson = await createLessonService({
    course_id: courseId,
    ...req.body,
  });

  return res.status(201).json({
    success: true,
    message: "Create lesson successfully",
    lesson,
  });
}

export async function getLessonsController(req: Request, res: Response) {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const lessons = await getLessonsService(courseId);

  return res.json({
    success: true,
    lessons,
  });
}

export async function getLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  const lesson = await getLessonService(id);

  return res.json({
    success: true,
    lesson,
  });
}

export async function updateLessonController(req: Request, res: Response) {
  const errors = validateLessonInput(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await updateLessonService(id, req.body);

  return res.json({
    success: true,
    message: "Update lesson successfully",
  });
}

export async function deleteLessonController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid lesson id",
    });
  }

  await deleteLessonService(id);

  return res.json({
    success: true,
    message: "Delete lesson successfully",
  });
}
```

## `apps/backend/src/services/lesson.service.ts`

```ts
import {
  createLesson,
  getLessonsByCourse,
  findLessonById,
  updateLesson,
  deleteLesson,
} from "../models/lesson.model";

import AppError from "../utils/AppError";

export async function createLessonService(data: any) {
  return await createLesson(data);
}

export async function getLessonsService(courseId: number) {
  return await getLessonsByCourse(courseId);
}

export async function getLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return lesson;
}

export async function updateLessonService(id: number, data: any) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  return await updateLesson(id, data);
}

export async function deleteLessonService(id: number) {
  const lesson = await findLessonById(id);

  if (!lesson) {
    throw new AppError("Lesson not found", 404);
  }

  await deleteLesson(id);

  return true;
}
```

## `apps/backend/src/models/lesson.model.ts`

```ts
import db from "../config/database";

export interface Lesson {
  id?: number;
  course_id: number;
  title: string;
  description?: string | null;
  video_url?: string | null;
  position?: number;
}

export async function createLesson(lesson: Lesson) {
  const [result] = await db.execute(
    `
    INSERT INTO lessons
    (
      course_id,
      title,
      description,
      video_url,
      position
    )
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      lesson.course_id,
      lesson.title,
      lesson.description ?? null,
      lesson.video_url ?? null,
      lesson.position ?? 1,
    ],
  );

  return result;
}

export async function getLessonsByCourse(courseId: number) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM lessons
    WHERE course_id = ?
    ORDER BY position ASC
    `,

    [courseId],
  );
  return rows;
}

export async function findLessonById(id: number) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM lessons
    WHERE id = ?
    `,
    [id],
  );
  const lessons = rows as any[];
  return lessons[0];
}

export async function updateLesson(id: number, lesson: Lesson) {
  const [result] = await db.execute(
    `
    UPDATE lessons
    SET
      title = ?,
      description = ?,
      video_url = ?,
      position = ?
    WHERE id = ?
    `,
    [
      lesson.title,
      lesson.description ?? null,
      lesson.video_url ?? null,
      lesson.position ?? 1,
      id,
    ],
  );

  return result;
}

export async function deleteLesson(id: number) {
  const [result] = await db.execute(
    `
    DELETE FROM lessons
    WHERE id = ?
    `,
    [id],
  );

  return result;
}
```

## `apps/backend/src/middlewares/ownership.middleware.ts`

```ts
import { Request, Response, NextFunction } from "express";
import { findCourseById, findCourseOwnerById } from "../models/course.model";
import { findLessonById } from "../models/lesson.model";

export async function requireCourseOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Admin được phép quản lý tất cả course
    if (user.role === "admin") {
      return next();
    }

    const courseId = Number(req.params.id || req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const course = await findCourseOwnerById(courseId);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.created_by !== user.id) {
      return res.status(403).json({
        message: "You can only manage your own courses",
      });
    }

    next();
  } catch (error) {
    next(error);

    return res.status(500).json({
      message: "Ownership check failed",
    });
  }
}

export async function requireLessonOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    // Admin được phép quản lý tất cả lesson
    if (user.role === "admin") {
      return next();
    }

    const lessonId = Number(req.params.id);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }

    const lesson = await findLessonById(lessonId);

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found",
      });
    }

    const course = await findCourseById(lesson.course_id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.created_by !== user.id) {
      return res.status(403).json({
        message: "You can only manage lessons of your own courses",
      });
    }

    next();
  } catch (error) {
    next(error);

    return res.status(500).json({
      message: "Ownership check failed",
    });
  }
}
```

## `apps/backend/src/middlewares/enrollment.middleware.ts`

```ts
import { Request, Response, NextFunction } from "express";

import { findEnrollment } from "../models/enrollment.model";
import { getLessonService } from "../services/lesson.service";

export async function requireLessonEnrollment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }

    const lessonId = Number(req.params.id);

    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid lesson id",
      });
    }

    const lesson = await getLessonService(lessonId);

    const enrollment = await findEnrollment(user.id, lesson.course_id);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course first",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
```

## `apps/backend/src/validators/lesson.validator.ts`

```ts
export function validateLessonInput(data: any) {
  const errors: Record<string, string> = {};

  if (typeof data.title !== "string" || data.title.trim().length < 3) {
    errors.title = "Lesson title must be at least 3 characters";
  }

  if (
    typeof data.description !== "string" ||
    data.description.trim().length < 10
  ) {
    errors.description = "Lesson description must be at least 10 characters";
  }

  if (typeof data.video_url !== "string" || !data.video_url.trim()) {
    errors.video_url = "Video URL is required";
  }

  if (
    data.position === undefined ||
    data.position === null ||
    data.position === ""
  ) {
    errors.position = "Position is required";
  } else {
    const position = Number(data.position);

    if (!Number.isInteger(position) || position < 1) {
      errors.position = "Position must be a positive integer";
    }
  }

  return errors;
}
```

## `apps/backend/src/middlewares/course-access.middleware.ts`

```ts
import { Request, Response, NextFunction } from "express";

import { findEnrollment } from "../models/enrollment.model";

export async function requireCourseEnrollment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (user.role === "admin" || user.role === "instructor") {
      return next();
    }

    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid course id",
      });
    }

    const enrollment = await findEnrollment(user.id, courseId);

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must enroll in this course first",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
}
```

## `apps/backend/src/routes/course.route.ts`

```ts
import { Router } from "express";

import {
  createCourseController,
  getCoursesController,
  getCourseDetailController,
  updateCourseController,
  deleteCourseController,
} from "../controllers/course.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { requireCourseOwner } from "../middlewares/ownership.middleware";

const router = Router();

// Create Course
// Admin + Instructor
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  createCourseController,
);

// Get Courses
// Public
router.get("/", getCoursesController);

// Get Course Detail
// Public
router.get("/:id", getCourseDetailController);

// Update Course
// Admin → tất cả course
// Instructor → chỉ course của mình
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  updateCourseController,
);

// Delete Course
// Admin → tất cả course
// Instructor → chỉ course của mình
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin", "instructor"]),
  requireCourseOwner,
  deleteCourseController,
);

export default router;
```
