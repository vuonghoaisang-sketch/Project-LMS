'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <Link
        href="/courses"
        className="text-lg font-bold text-blue-700 sm:text-xl"
      >
        LMS Platform
      </Link>

      <nav className="flex items-center gap-2 sm:gap-4" aria-label="Account">
        {user ? (
          <>
            <span className="hidden max-w-48 truncate font-medium text-slate-700 sm:inline">
              Hello, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 sm:px-4"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/login')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-4"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-4"
            >
              Register
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
