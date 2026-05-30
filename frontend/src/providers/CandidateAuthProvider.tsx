"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { candidateAuthService } from '@/services/candidate-auth.service';

interface CandidateAuthContextType {
  user: any | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const CandidateAuthContext = createContext<CandidateAuthContextType | undefined>(undefined);

export function CandidateAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = candidateAuthService.getToken();
        if (token) {
          const userData = await candidateAuthService.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error('Candidate auth init error:', error);
        candidateAuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname.startsWith('/candidate/dashboard')) {
        router.push('/candidate/login');
      } else if (user && (pathname === '/candidate/login' || pathname === '/candidate/register')) {
        router.push('/candidate/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (data: any) => {
    await candidateAuthService.login(data);
    const userData = await candidateAuthService.getMe();
    setUser(userData);
    router.push('/candidate/dashboard');
  };

  const register = async (data: any) => {
    await candidateAuthService.register(data);
    router.push('/candidate/login');
  };

  const logout = () => {
    candidateAuthService.logout();
    setUser(null);
    router.push('/candidate/login');
  };

  return (
    <CandidateAuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </CandidateAuthContext.Provider>
  );
}

export const useCandidateAuth = () => {
  const context = useContext(CandidateAuthContext);
  if (context === undefined) {
    throw new Error('useCandidateAuth must be used within a CandidateAuthProvider');
  }
  return context;
};
