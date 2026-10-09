import Link from 'next/link';

import { Course } from '@/types/course';

export default function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/courses/${course.id}`}
        className="block h-full focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`View course: ${course.title}`}
      >
        <div
          role={course.thumbnail ? 'img' : undefined}
          aria-label={course.thumbnail ? `${course.title} cover` : undefined}
          className="h-36 bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-500 bg-cover bg-center sm:h-44"
          style={
            course.thumbnail
              ? { backgroundImage: `url("${course.thumbnail}")` }
              : undefined
          }
        >
          {!course.thumbnail && (
            <div className="flex h-full items-end p-5">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white backdrop-blur">
                COURSE
              </span>
            </div>
          )}
        </div>
        <div className="flex min-h-60 flex-col p-5">
          <span className="mb-2 w-fit rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {course.category || 'General'}
          </span>
          <h2 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-blue-700 sm:text-xl">
            {course.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {course.description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <span className="truncate text-sm text-slate-500">
              {course.instructor_name || 'LMS Instructor'}
            </span>
            <span className="shrink-0 font-bold text-blue-700">
              {Number(course.price) === 0
                ? 'Free'
                : `$${Number(course.price).toFixed(2)}`}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
