'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { login } from '@/services/auth.service';
import AuthCard from './AuthCard';
import AuthTitle from './AuthTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login({
        email,
        password,
      });

      // lưu JWT
      localStorage.setItem('token', result.token);

      localStorage.setItem('user', JSON.stringify(result.user));

      // chuyển sang dashboard
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthCard>
      <AuthTitle title="Welcome Back" description="Login to your LMS account" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Login</Button>
      </form>
    </AuthCard>
  );
}
