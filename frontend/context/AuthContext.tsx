'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../lib/api';
import { disconnectSocket } from '../lib/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: { emailOrUsername: string; password: string }) => Promise<void>;
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('chat_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          api.clearToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (credentials: { emailOrUsername: string; password: string }) => {
    const res = await api.login(credentials);
    api.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (credentials: { email: string; username: string; password: string }) => {
    const res = await api.register(credentials);
    api.setToken(res.token);
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
      api.clearToken();
      setUser(null);
      setToken(null);
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
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
