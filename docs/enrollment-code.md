# Enrollment code tổng hợp

Các file dưới đây được trích từ source hiện có.

## `apps/frontend/src/services/enrollment.service.ts`

```ts
import api from '@/lib/axios';

export async function enrollCourse(courseId: number) {
  const token = localStorage.getItem('token');

  const response = await api.post(
    '/enrollments',
    {
      course_id: courseId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
}

export async function getMyEnrollments() {
  const token = localStorage.getItem('token');

  const response = await api.get('/enrollments/my', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function checkEnrollment(courseId: number) {
  const token = localStorage.getItem('token');
  const response = await api.get(`/enrollments/check/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
```

## `apps/frontend/src/types/enrollment.ts`

```ts
export interface Enrollment {
  id: number;
  course_id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  enrolled_at: string;
}
```

## `apps/frontend/src/app/(dashboard)/my-courses/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getMyEnrollments } from '@/services/enrollment.service';
import { Enrollment } from '@/types/enrollment';

import Loading from '@/components/ui/Loading';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        setError('');

        const data = await getMyEnrollments();

        setCourses(data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  if (loading) {
    return <Loading text="Loading your courses..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (courses.length === 0) {
    return <EmptyState message="You haven't enrolled in any course yet." />;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">My Courses</h1>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course.id} className="rounded-xl border p-5">
            <h2 className="text-xl font-bold">{course.title}</h2>

            <p className="mt-2 text-gray-600">{course.description}</p>

            <p className="mt-3 text-sm text-gray-500">
              Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}
            </p>

            <Link
              href={`/courses/${course.course_id}`}
              className="mt-5 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Course
            </Link>
          </div>
        ))}
      </div>
    </div>
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

## `apps/frontend/src/app/(public)/courses/[id]/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getCourseById, deleteCourse } from '@/services/course.service';
import { checkEnrollment, enrollCourse } from '@/services/enrollment.service';

import { Course } from '@/types/course';
import { useAuth } from '@/context/AuthContext';

import LessonList from '@/components/lesson/LessonList';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

import { getErrorMessage } from '@/utils/error';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseDetailPage({ params }: Props) {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  const [enrolling, setEnrolling] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    async function loadCourse() {
      try {
        setLoading(true);
        setError('');

        const { id } = await params;
        const courseId = Number(id);

        const data = await getCourseById(courseId);

        setCourse(data);

        if (user?.role === 'student') {
          const enrollment = await checkEnrollment(courseId);

          setEnrolled(enrollment.enrolled);
        } else {
          setEnrolled(false);
        }
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params, user, authLoading]);

  async function handleDelete() {
    if (!course) return;

    const confirmDelete = confirm(
      'Are you sure you want to delete this course?',
    );

    if (!confirmDelete) return;

    try {
      await deleteCourse(course.id!);

      alert('Delete course successfully');

      router.push('/courses');
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  async function handleEnroll() {
    if (!course) return;

    try {
      setEnrolling(true);

      await enrollCourse(course.id!);

      setEnrolled(true);

      alert('Enroll course successfully');
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    } finally {
      setEnrolling(false);
    }
  }

  if (authLoading) {
    return <Loading text="Loading user..." />;
  }

  if (loading) {
    return <Loading text="Loading course..." />;
  }

  if (error) {
    return (
      <div className="max-w-xl">
        <ErrorState message={error} />

        <Link
          href="/courses"
          className="mt-5 inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl">
        <ErrorState message="Course not found." />

        <Link
          href="/courses"
          className="mt-5 inline-block rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link
        href="/courses"
        className="mb-6 inline-block rounded border px-4 py-2 hover:bg-gray-50"
      >
        ← Back to Courses
      </Link>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{course.title}</h1>

        <p className="mt-4 leading-7 text-gray-600">{course.description}</p>

        <div className="mt-6 space-y-2">
          <p>
            <strong>Instructor:</strong> {course.instructor_name}
          </p>

          <p>
            <strong>Price:</strong> ${course.price}
          </p>
        </div>

        {user?.role === 'student' && (
          <div className="mt-6">
            {!enrolled ? (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Course'}
              </button>
            ) : (
              <div className="rounded-lg bg-green-50 px-4 py-3 text-green-700">
                ✓ You are enrolled in this course
              </div>
            )}
          </div>
        )}

        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/courses/${course.id}/edit`}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-white transition hover:bg-blue-700"
            >
              Edit Course
            </Link>

            <button
              onClick={handleDelete}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-white transition hover:bg-red-700"
            >
              Delete Course
            </button>
          </div>
        )}
      </div>

      <LessonList courseId={course.id!} />

      {(user?.role === 'admin' || user?.role === 'instructor') && (
        <Link
          href={`/courses/${course.id}/lessons/create`}
          className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-white transition hover:bg-green-700"
        >
          + Add Lesson
        </Link>
      )}
    </div>
  );
}
```

## `apps/backend/src/routes/enrollment.route.ts`

```ts
import express from "express";

import {
  enrollCourseController,
  getMyEnrollmentsController,
  checkEnrollmentController,
  getCourseEnrollmentCountController,
} from "../controllers/enrollment.controller";

import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = express.Router();

// ========================================
// ENROLL COURSE
// ========================================

// POST /api/enrollments
// Student only
router.post(
  "/",
  authMiddleware,
  requireRole(["student"]),
  enrollCourseController,
);

// ========================================
// MY COURSES
// ========================================

// GET /api/enrollments/my
// Student only
router.get(
  "/my",
  authMiddleware,
  requireRole(["student"]),
  getMyEnrollmentsController,
);

// ========================================
// CHECK ENROLLMENT
// ========================================

// GET /api/enrollments/check/:courseId
// Student only
router.get(
  "/check/:courseId",
  authMiddleware,
  requireRole(["student"]),
  checkEnrollmentController,
);

// ========================================
// COURSE ENROLLMENT COUNT
// ========================================

// GET /api/enrollments/course/:courseId/count
// Public
router.get("/course/:courseId/count", getCourseEnrollmentCountController);

export default router;
```

## `apps/backend/src/controllers/enrollment.controller.ts`

```ts
import { Request, Response } from "express";

import {
  enrollUser,
  getUserEnrollments,
  isUserEnrolled,
  getCourseEnrollmentCount,
} from "../services/enrollment.service";

export async function enrollCourseController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const courseId = Number(req.body.course_id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course_id",
    });
  }

  const result = await enrollUser(userId, courseId);

  return res.status(201).json({
    success: true,
    message: "Enroll course successfully",
    enrollment: result,
  });
}

export async function getMyEnrollmentsController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const enrollments = await getUserEnrollments(userId);

  return res.json(enrollments);
}

export async function checkEnrollmentController(req: Request, res: Response) {
  const userId = (req as any).user.id;

  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const enrolled = await isUserEnrolled(userId, courseId);

  return res.json({
    success: true,
    enrolled,
  });
}

export async function getCourseEnrollmentCountController(
  req: Request,
  res: Response,
) {
  const courseId = Number(req.params.courseId);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid course id",
    });
  }

  const count = await getCourseEnrollmentCount(courseId);

  return res.json({
    success: true,
    count,
  });
}
```

## `apps/backend/src/services/enrollment.service.ts`

```ts
import {
  createEnrollment,
  findEnrollment,
  getEnrollmentsByUser,
  getEnrollmentCount,
} from "../models/enrollment.model";

import AppError from "../utils/AppError";
import { findCourseById } from "../models/course.model";
export async function enrollUser(userId: number, courseId: number) {
  const course = await findCourseById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  const existingEnrollment = await findEnrollment(userId, courseId);

  if (existingEnrollment) {
    throw new AppError("User already enrolled in this course", 409);
  }

  return createEnrollment(userId, courseId);
}

export async function getUserEnrollments(userId: number) {
  return getEnrollmentsByUser(userId);
}

export async function isUserEnrolled(userId: number, courseId: number) {
  const enrollment = await findEnrollment(userId, courseId);

  return !!enrollment;
}

export async function getCourseEnrollmentCount(courseId: number) {
  return getEnrollmentCount(courseId);
}
```

## `apps/backend/src/models/enrollment.model.ts`

```ts
import db from "../config/database";

export interface Enrollment {
  id?: number;
  user_id: number;
  course_id: number;
  enrolled_at?: Date;
}

export async function createEnrollment(userId: number, courseId: number) {
  const [result] = await db.execute(
    `
    INSERT INTO enrollments
    (
      user_id,
      course_id
    )
    VALUES (?, ?)
    `,
    [userId, courseId],
  );

  return result;
}

export async function findEnrollment(userId: number, courseId: number) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM enrollments
    WHERE user_id = ?
      AND course_id = ?
    `,
    [userId, courseId],
  );

  const enrollments = rows as any[];

  return enrollments[0];
}

export async function getEnrollmentsByUser(userId: number) {
  const [rows] = await db.query(
    `
    SELECT
      e.id,
      e.enrolled_at,
      c.id AS course_id,
      c.title,
      c.description,
      c.thumbnail,
      c.price
    FROM enrollments e
    JOIN courses c
      ON e.course_id = c.id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
    `,
    [userId],
  );

  return rows;
}

export async function getEnrollmentCount(courseId: number) {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM enrollments
    WHERE course_id = ?
    `,
    [courseId],
  );

  const result = rows as any[];

  return result[0]?.total ?? 0;
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
