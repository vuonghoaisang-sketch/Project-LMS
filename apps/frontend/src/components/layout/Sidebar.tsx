'use client';

import Link from 'next/link';

import { getUser } from '@/utils/auth';

export default function Sidebar() {
  const user = getUser();

  return (
    <aside className="p-6">
      <h2 className="mb-6 text-xl font-bold">Dashboard</h2>
      <nav className="space-y-3">
        {/* Public */}
        <Link href="/" className="block">
          Home
        </Link>
        <Link href="/courses" className="block">
          Courses
        </Link>
        {/* Student */}
        {user?.role === 'student' && (
          <Link href="/my-courses" className="block">
            My Courses
          </Link>
        )}
        {/* Admin + Instructor */}
        {(user?.role === 'admin' || user?.role === 'instructor') && (
          <Link href="/create-course" className="block">
            Create Course
          </Link>
        )}
        {/* Admin */}
        {user?.role === 'admin' && (
          <Link href="/users" className="block">
            Manage Users
          </Link>
        )}
      </nav>
    </aside>
  );
}
