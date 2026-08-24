'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { login } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/error';

import { loginSchema, LoginFormData } from '@/schemas/auth.schema';
import { useAuth } from '@/context/AuthContext';

import AuthCard from './AuthCard';
import AuthTitle from './AuthTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const router = useRouter();

  const { loginUser } = useAuth();

  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setError('');

    try {
      const result = await login(data);

      loginUser(result.user, result.token);

      router.push('/');
    } catch (error) {
      console.error(error);

      setError(getErrorMessage(error));
    }
  }

  return (
    <AuthCard>
      <AuthTitle title="Login" description="Login to your LMS account" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <Input type="email" placeholder="Email" {...register('email')} />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            {...register('password')}
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </AuthCard>
  );
}
