'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import api from '@/lib/axios';
import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginUser: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/auth/me');

        const currentUser = res.data.user;

        setUser(currentUser);
        localStorage.setItem('user', JSON.stringify(currentUser));
      } catch (error) {
        console.error('Get current user failed:', error);

        localStorage.removeItem('token');
        localStorage.removeItem('user');

        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getCurrentUser();
  }, []);

  function loginUser(user: User, token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be inside AuthProvider');
  }

  return context;
}
