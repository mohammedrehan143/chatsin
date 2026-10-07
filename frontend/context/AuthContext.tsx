'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { phoneNumber?: string; identifier?: string; emailOrUsername?: string; password: string }) => Promise<void>;
  register: (data: { phoneNumber?: string; email?: string; username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Immediately hydrate from persistent local storage so info is never forgotten
    const storedToken = api.getToken();
    const storedUser = api.getSavedUser();

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(storedUser);
      }

      // Verify and sync latest user profile in background
      api.getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            api.setSavedUser(res.user);
          }
        })
        .catch((err) => {
          console.warn('[Auth] Background session check warning:', err.message);
          // Only clear if server explicitly returned 401 Unauthorized
          if (err.message.includes('401') || err.message.includes('expired') || err.message.includes('UNAUTHORIZED')) {
            api.clearSession();
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { phoneNumber?: string; identifier?: string; emailOrUsername?: string; password: string }) => {
    const res = await api.login(credentials);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (credentials: { phoneNumber?: string; email?: string; username: string; password: string }) => {
    const res = await api.register(credentials);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout error', err);
    } finally {
      disconnectSocket();
      api.clearSession();
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const merged = { ...user, ...updated };
      setUser(merged);
      api.setSavedUser(merged);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
