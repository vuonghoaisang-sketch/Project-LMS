'use client';

import Link from 'next/link';
import { getUser } from '@/utils/auth';

export default function Sidebar() {
  const user = getUser();

  return (
    <aside className="min-h-screen w-64 border-r p-5">
      <h2 className="mb-6 text-xl font-bold">Dashboard</h2>

      <nav className="space-y-3">
        <Link href="/">Home</Link>
        <hr />

        <Link href="/courses">Courses</Link>

        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <Link href="/create-course">Create Course</Link>
        )}

        {user?.role === 'admin' && (
          <Link href="/dashboard/users">Manage Users</Link>
        )}
      </nav>
    </aside>
  );
}
