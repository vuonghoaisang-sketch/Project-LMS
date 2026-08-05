'use client';

import { useState } from 'react';

import AuthCard from './AuthCard';
import AuthTitle from './AuthTitle';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    console.log({
      fullName,
      email,
      password,
      confirmPassword,
    });
  }

  return (
    <AuthCard>
      <AuthTitle title="Create Account" description="Create your LMS account" />

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

        <Button type="submit">Register</Button>
      </form>
    </AuthCard>
  );
}
