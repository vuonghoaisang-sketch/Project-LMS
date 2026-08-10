'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import AuthCard from './AuthCard';
import AuthTitle from './AuthTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

import api from '@/lib/axios';

export default function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');

      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register', {
        name: fullName,
        email,
        password,
      });

      alert('Register successfully');

      router.push('/login');
    } catch (error: any) {
      console.error(error);

      setError(error?.response?.data?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard>
      <AuthTitle title="Register" description="Create your account" />

      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

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

        <Input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </AuthCard>
  );
}
