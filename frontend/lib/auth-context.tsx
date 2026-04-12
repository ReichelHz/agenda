'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { authApi, usersApi, setToken, clearToken, getToken } from './api';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'PATIENT' | 'PROFESSIONAL' | 'ADMIN';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from stored token
  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    usersApi
      .me()
      .then((data) => setUser(data as User))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await authApi.login(email, password);
    setToken(token);
    const data = await usersApi.me();
    setUser(data as User);
  }, []);

  const logout = useCallback(async () => {
    clearToken();
    setUser(null);
    await authApi.logout().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
