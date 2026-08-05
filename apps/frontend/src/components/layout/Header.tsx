'use client';

import { useRouter } from 'next/navigation';

import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  const router = useRouter();

  function handleLogout() {
    logout();

    router.push('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-xl font-bold text-blue-600">LMS Platform</h1>

      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <span className="font-medium">Hello, {user.name}</span>

            <button
              onClick={handleLogout}
              className="rounded bg-red-500 px-4 py-2 text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push('/login')}
              className="rounded border px-4 py-2"
            >
              Login
            </button>

            <button
              onClick={() => router.push('/register')}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              Register
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
