import api from '@/lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get('/users');

  return response.data.users;
}

export async function updateUserRole(id: number, role: User['role']) {
  const response = await api.put(`/users/${id}/role`, {
    role,
  });

  return response.data;
}

export async function deleteUser(id: number) {
  const response = await api.delete(`/users/${id}`);

  return response.data;
}
