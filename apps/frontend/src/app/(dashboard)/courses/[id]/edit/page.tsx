'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCourseById, updateCourse } from '@/services/course.service';

import RoleGuard from '@/components/auth/RoleGuard';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCoursePage({ params }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCourse() {
      try {
        const { id } = await params;

        const course = await getCourseById(Number(id));

        setTitle(course.title ?? '');
        setDescription(course.description ?? '');
        setPrice(Number(course.price ?? 0));
      } catch (error) {
        console.error(error);

        setError('Failed to load course.');
      } finally {
        setLoading(false);
      }
    }

    loadCourse();
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { id } = await params;

      await updateCourse(Number(id), {
        title,
        description,
        price,
      });

      alert('Update successfully');

      router.push(`/courses/${id}`);
    } catch (error) {
      console.error(error);

      setError('Failed to update course.');
    }
  }

  if (loading) {
    return <Loading text="Loading course..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <RoleGuard allowedRoles={['admin', 'instructor']}>
      <div className="max-w-xl">
        <h1 className="mb-6 text-3xl font-bold">Edit Course</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded border p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
          />

          <textarea
            className="w-full rounded border p-3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={5}
          />

          <input
            type="number"
            className="w-full rounded border p-3"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Price"
          />

          <button
            type="submit"
            className="rounded bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </RoleGuard>
  );
}
