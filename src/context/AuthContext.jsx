'use client';
// ============================================
// FILE: src/context/AuthContext.jsx
// Global auth state — reads localStorage session
// ============================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { getCurrentUser, logout as authLogout } from '../lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Read persisted session on mount (client-only)
  useEffect(() => {
    const stored = getCurrentUser();
    setUser(stored);
    setLoading(false);
  }, []);

  /** Refresh user state from localStorage (call after login) */
  const refreshUser = useCallback(() => {
    const stored = getCurrentUser();
    setUser(stored);
  }, []);

  /** Clear session and redirect */
  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
