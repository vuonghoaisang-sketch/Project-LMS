import api from '@/lib/axios';
import { LoginInput, RegisterInput } from '@/types/auth';

export async function login(data: LoginInput) {
  const response = await api.post('/auth/login', data);

  return response.data;
}

export async function register(data: RegisterInput) {
  const response = await api.post('/auth/register', data);

  return response.data;
}
