'use client';

import { ReactNode } from 'react';

import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading text="Checking permission..." />;
  }

  if (!user) {
    return <ErrorState message="You must be logged in to access this page." />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <ErrorState message="You don't have permission to access this page." />
    );
  }

  return <>{children}</>;
}
