'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { getStoredToken, removeStoredToken, setStoredToken } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url?: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  requestOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, code: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = useCallback((t: string) => {
    setStoredToken(t);
    setToken(t);
  }, []);

  const clearAuth = useCallback(() => {
    removeStoredToken();
    setToken(null);
    setUser(null);
  }, []);

  // On mount: validate stored token via /auth/me
  useEffect(() => {
    async function init() {
      const t = getStoredToken();
      if (!t) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get<{ data: User }>('/auth/me', t);
        setToken(t);
        setUser(res.data);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuth();
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [clearAuth]);

  const requestOTP = useCallback(async (email: string) => {
    await api.post('/auth/email/request', { email });
  }, []);

  const verifyOTP = useCallback(
    async (email: string, code: string) => {
      const res = await api.post<{ data: { token: string; user: User } }>('/auth/email/verify', { email, code });
      saveToken(res.data.token);
      setUser(res.data.user);
    },
    [saveToken],
  );

  const loginWithGoogle = useCallback(
    async (idToken: string) => {
      const res = await api.post<{ data: { token: string; user: User } }>('/auth/google', { id_token: idToken });
      saveToken(res.data.token);
      setUser(res.data.user);
    },
    [saveToken],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, requestOTP, verifyOTP, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
