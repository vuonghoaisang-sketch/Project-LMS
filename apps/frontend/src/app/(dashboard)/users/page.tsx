'use client';

import { useEffect, useState } from 'react';

import {
  deleteUser,
  getUsers,
  updateUserRole,
  User,
} from '@/services/user.service';

import UserTable from '@/components/user/UserTable';
import Loading from '@/components/ui/Loading';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import RoleGuard from '@/components/auth/RoleGuard';

import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/utils/error';

export default function UsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const data = await getUsers();

        setUsers(data);
      } catch (error) {
        console.error(error);

        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  async function handleRoleChange(id: number, role: User['role']) {
    const selectedUser = users.find((item) => item.id === id);

    if (!selectedUser) return;

    if (selectedUser.role === role) return;

    const confirmed = confirm(`Change ${selectedUser.name}'s role to ${role}?`);

    if (!confirmed) return;

    try {
      await updateUserRole(id, role);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === id
            ? {
                ...item,
                role,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  async function handleDelete(id: number) {
    const selectedUser = users.find((item) => item.id === id);

    if (!selectedUser) return;

    const confirmed = confirm(
      `Are you sure you want to delete ${selectedUser.name}?`,
    );

    if (!confirmed) return;

    try {
      await deleteUser(id);

      setUsers((currentUsers) => currentUsers.filter((item) => item.id !== id));
    } catch (error) {
      console.error(error);

      alert(getErrorMessage(error));
    }
  }

  if (loading) {
    return <Loading text="Loading users..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      {users.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Manage Users</h1>

            <p className="mt-2 text-gray-600">
              Manage user accounts and roles.
            </p>
          </div>

          <UserTable
            users={users}
            currentUserId={user?.id ?? 0}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        </div>
      )}
    </RoleGuard>
  );
}
