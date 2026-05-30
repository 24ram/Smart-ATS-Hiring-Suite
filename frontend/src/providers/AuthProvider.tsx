"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authService.initToken();
    const token = localStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(u => setUser(u))
        .catch(() => {
          authService.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    await authService.login(data);
    const u = await authService.getCurrentUser();
    setUser(u);
    if (u.role === 'admin') {
      router.push('/admin/dashboard');
    } else if (u.role === 'hiring_manager') {
      router.push('/hm/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const register = async (data: any) => {
    await authService.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
