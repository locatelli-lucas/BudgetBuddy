// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  async function loadStoredData() {
    try {
      const [token, storedUser] = await AsyncStorage.multiGet(['accessToken', 'user']);
      if (token[1] && storedUser[1]) {
        setUser(JSON.parse(storedUser[1]));
      }
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password });
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    setUser(data.user);
  }

  async function signUp(name: string, email: string, password: string) {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    setUser(data.user);
  }

  async function signOut() {
    try { await api.post('/api/auth/logout'); } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
