'use client';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col md:flex-row">
        {user && <Sidebar />}
        <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
