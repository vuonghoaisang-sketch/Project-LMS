'use client';

import { useEffect, useMemo, useState } from 'react';

import { getCourses } from '@/services/course.service';
import { getErrorMessage } from '@/utils/error';
import { Course } from '@/types/course';

import CourseCard from './CourseCard';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';

const PAGE_SIZE = 9;

type SortOrder = 'newest' | 'price-ascending' | 'price-descending';

export default function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError('');
        const data = await getCourses();
        if (active) setCourses(data);
      } catch (error) {
        console.error(error);
        if (active) setError(getErrorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourses();
    return () => {
      active = false;
    };
  }, [retryCount]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = courses.filter((course) => {
      const matchesCategory =
        category === 'all' || (course.category || 'General') === category;
      const matchesQuery = [
        course.title,
        course.description,
        course.instructor_name,
      ]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });

    if (sortOrder === 'price-ascending') {
      return filtered.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortOrder === 'price-descending') {
      return filtered.sort((a, b) => Number(b.price) - Number(a.price));
    }
    return filtered;
  }, [courses, query, category, sortOrder]);

  const categories = useMemo(
    () =>
      Array.from(new Set(courses.map((course) => course.category || 'General')))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [courses],
  );

  const pageCount = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const visibleCourses = filteredCourses.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  function updateSort(value: SortOrder) {
    setSortOrder(value);
    setPage(1);
  }

  if (loading) {
    return (
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        aria-label="Loading courses"
        aria-busy="true"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="h-36 animate-pulse bg-slate-200 sm:h-44" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <ErrorState
        message={error}
        action={
          <button
            type="button"
            onClick={() => setRetryCount((current) => current + 1)}
            className="rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800"
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <section aria-label="Course catalog">
      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_12rem_12rem] sm:p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Search courses
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Title, instructor, or description"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Sort by
          </span>
          <select
            value={sortOrder}
            onChange={(event) => updateSort(event.target.value as SortOrder)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="newest">Newest</option>
            <option value="price-ascending">Price: low to high</option>
            <option value="price-descending">Price: high to low</option>
          </select>
        </label>
      </div>

      <p className="mb-4 text-sm text-slate-500" aria-live="polite">
        {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
      </p>

      {filteredCourses.length === 0 ? (
        <EmptyState
          title={query ? 'No matching courses' : 'No courses available'}
          message={
            query
              ? 'Try another title, instructor, or keyword.'
              : 'Courses will appear here when they are published.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {pageCount > 1 && (
            <nav
              className="mt-8 flex items-center justify-center gap-4"
              aria-label="Course pages"
            >
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600" aria-live="polite">
                Page {page} of {pageCount}
              </span>
              <button
                type="button"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
