'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { authApi, usersApi } from './api';

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

  // On mount, try to restore session from httpOnly cookie
  useEffect(() => {
    usersApi
      .me()
      .then((data) => setUser(data as User))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // POST /api/auth/login → route handler sets httpOnly cookie
    await authApi.login(email, password);
    // Fetch user profile now that cookie is set
    const data = await usersApi.me();
    setUser(data as User);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
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
