import api from '@/lib/axios';
import { LoginInput, RegisterInput } from '@/types/auth';
import { User } from '@/types/user';

export async function login(data: LoginInput) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterInput) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export async function getMe(): Promise<{ success: boolean; user: User }> {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function refreshToken() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}
