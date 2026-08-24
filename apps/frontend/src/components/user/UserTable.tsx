'use client';

import { User } from '@/services/user.service';

interface UserTableProps {
  users: User[];
  currentUserId?: number;
  onRoleChange: (id: number, role: User['role']) => void;
  onDelete: (id: number) => void;
}

export default function UserTable({
  users,
  currentUserId,
  onRoleChange,
  onDelete,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full min-w-[700px]">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-5 py-4 text-left text-sm font-semibold">ID</th>

            <th className="px-5 py-4 text-left text-sm font-semibold">Name</th>

            <th className="px-5 py-4 text-left text-sm font-semibold">Email</th>

            <th className="px-5 py-4 text-left text-sm font-semibold">Role</th>

            <th className="px-5 py-4 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;

            return (
              <tr key={user.id}>
                <td className="px-5 py-4 text-sm">{user.id}</td>

                <td className="px-5 py-4 font-medium">
                  {user.name}
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </td>

                <td className="px-5 py-4 text-sm text-gray-600">
                  {user.email}
                </td>

                <td className="px-5 py-4">
                  <select
                    value={user.role}
                    disabled={isCurrentUser}
                    onChange={(e) =>
                      onRoleChange(user.id, e.target.value as User['role'])
                    }
                    className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    disabled={isCurrentUser}
                    onClick={() => onDelete(user.id)}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
