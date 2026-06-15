// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setOnAuthExpired } from '../services/api';
import { User, LoginResponse } from '../types/auth';
import { authService } from '../services/auth.service';

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, twoFactorCode?: string) => Promise<LoginResponse>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  // Register signOut with the API interceptor so expired tokens redirect to login
  useEffect(() => {
    setOnAuthExpired(signOut);
    return () => setOnAuthExpired(null);
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

  async function signIn(email: string, password: string, twoFactorCode?: string): Promise<LoginResponse> {
    const data = await authService.login(email, password, twoFactorCode);
    if (!data.requiresTwoFactor) {
      await AsyncStorage.multiSet([
        ['accessToken', data.accessToken],
        ['refreshToken', data.refreshToken],
        ['user', JSON.stringify(data.user)],
      ]);
      setUser(data.user);
    }
    return data;
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await authService.register(name, email, password);
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    setUser(data.user);
  }

  const signOut = useCallback(async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);
    if (refreshToken) {
      api.post('/api/v1/auth/logout', { refreshToken }).catch(() => {});
    }
  }, []);

  async function refreshUser() {
    try {
      const updatedUser = await authService.getCurrentUser();
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {
      console.error('Failed to refresh user data', e);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

