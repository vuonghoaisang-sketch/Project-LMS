'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';

import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } finally {
      setIsLoggingOut(false);
    }
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
        <NotificationBell />
        {user ? (
          <>
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-300 shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden max-w-48 truncate font-medium text-slate-700 sm:inline">
                {user.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:px-4"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
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
