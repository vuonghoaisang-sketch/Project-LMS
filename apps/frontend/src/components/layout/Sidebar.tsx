'use client';

import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 border-r p-6">
      <h2 className="mb-6 text-xl font-bold">Dashboard</h2>

      <nav className="space-y-3">
        <Link href="/" className="block">
          Home
        </Link>

        <Link href="/courses" className="block">
          Courses
        </Link>

        {user?.role === 'student' && (
          <Link href="/my-courses" className="block">
            My Courses
          </Link>
        )}

        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <Link href="/create-course" className="block">
            Create Course
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link href="/users" className="block">
            Manage Users
          </Link>
        )}
      </nav>
    </aside>
  );
}
