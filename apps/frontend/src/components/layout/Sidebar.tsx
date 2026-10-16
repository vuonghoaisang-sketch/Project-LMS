'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home', visible: true },
    { href: '/courses', label: 'Courses', visible: true },
    {
      href: '/my-courses',
      label: 'My Courses',
      visible: user?.role === 'student',
    },
    {
      href: '/orders',
      label: 'My Orders',
      visible: user?.role === 'student',
    },
    {
      href: '/create-course',
      label: 'Create Course',
      visible: user?.role === 'admin' || user?.role === 'instructor',
    },
    { href: '/users', label: 'Manage Users', visible: user?.role === 'admin' },
  ].filter((link) => link.visible);

  const navigation = (
    <nav className="space-y-1" aria-label="Main navigation">
      {links.map(({ href, label }) => {
        const active =
          href === '/' ? pathname === '/' : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            onClick={() => setOpen(false)}
            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="border-b px-4 py-3 md:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-sidebar-navigation"
          onClick={() => setOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <span>Menu</span>
          <span aria-hidden="true">{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div id="mobile-sidebar-navigation" className="pt-2">
            {navigation}
          </div>
        )}
      </div>

      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 md:block">
        <h2 className="mb-4 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </h2>
        {navigation}
      </aside>
    </>
  );
}
