'use client';

import { useState } from 'react';
import { createCourse } from '@/services/course.service';

export default function CourseForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      await createCourse({
        title,
        description,
        price: Number(price),
      });

      alert('Create course successfully!');

      setTitle('');
      setDescription('');
      setPrice('');
    } catch (error) {
      console.error(error);
      alert('Create course failed!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border bg-white p-6 shadow"
    >
      <div>
        <label className="mb-2 block font-medium">Course Title</label>

        <input
          className="w-full rounded-lg border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="React Masterclass"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Description</label>

        <textarea
          className="h-32 w-full rounded-lg border p-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course description..."
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">Price</label>

        <input
          type="number"
          className="w-full rounded-lg border p-3"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="99"
        />
      </div>

      <button
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  );
}
