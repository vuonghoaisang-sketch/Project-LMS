'use client';

import { useState } from 'react';
import { login } from '@/services/auth.service';
import AuthCard from './AuthCard';
import AuthTitle from './AuthTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const result = await login({
        email,
        password,
      });
      console.log('Login Success:', result);
    } catch (error) {
      console.error('Login Failed:', error);
    }
  }

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
