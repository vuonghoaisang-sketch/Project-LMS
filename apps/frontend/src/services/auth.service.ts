import api from '@/lib/axios';

export type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await api.post('/auth/login', payload);

  return response.data;
}

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function register(payload: RegisterPayload) {
  const response = await api.post('/auth/register', payload);

  return response.data;
}
