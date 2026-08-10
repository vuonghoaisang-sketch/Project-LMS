import RoleGuard from '@/components/auth/RoleGuard';

export default function UsersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="mt-2 text-gray-600">Admin can manage users here.</p>
      </div>
    </RoleGuard>
  );
}
