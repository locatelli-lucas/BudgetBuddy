// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setOnAuthExpired } from '../services/api';
import { User, LoginResponse } from '../types/auth';
import { authService } from '../services/auth.service';
import { useErrorToast } from './ErrorToastContext';

// Import GoogleSignin safely
let GoogleSignin: any = null;
try {
  GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin;
} catch (e) {
  console.log('Google Sign-In native module not available');
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<LoginResponse>;
  signInWithGoogle: () => Promise<LoginResponse>;
  verify2FA: (temporaryToken: string, code: string) => Promise<void>;
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

    // Initialize Google SDK safely
    if (GoogleSignin) {
      try {
        GoogleSignin.configure({
          webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Placeholder
          offlineAccess: true,
        });
      } catch (e) {
        console.warn('Failed to configure Google Sign-In');
      }
    }
  }, []);

  const { showMessage, showError } = useErrorToast();

  const handleAuthExpired = useCallback((isForced?: boolean) => {
    signOut();
    if (isForced) {
      showMessage('Sessão expirada. Faça login novamente.');
    }
  }, [signOut, showMessage]);

  useEffect(() => {
    setOnAuthExpired(handleAuthExpired);
    return () => setOnAuthExpired(null);
  }, [handleAuthExpired]);

  async function loadStoredData() {
    try {
      const [token, storedUser] = await AsyncStorage.multiGet(['accessToken', 'user']);
      if (token[1] && storedUser[1]) {
        setUser(JSON.parse(storedUser[1]));
      }
    } catch (e) {
      showError(e, 'Failed to load auth data');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSuccessfulLogin(data: LoginResponse) {
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
    setUser(data.user);
  }

  async function signIn(email: string, password: string): Promise<LoginResponse> {
    const data = await authService.login(email, password);
    if (!data.requires2FA) {
      await handleSuccessfulLogin(data);
    }
    return data;
  }

  async function signInWithGoogle(): Promise<LoginResponse> {
    if (!GoogleSignin) {
      throw new Error('Google Sign-In não está disponível neste ambiente. Use um build nativo (npx expo run:android).');
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (!userInfo.idToken) {
        throw new Error('Google ID Token not found');
      }

      const data = await authService.googleLogin(userInfo.idToken);
      if (!data.requires2FA) {
        await handleSuccessfulLogin(data);
      }
      return data;
    } catch (e: any) {
      if (e.message?.includes('RNGoogleSignin') || e.code === 'not_available') {
        throw new Error('Google Sign-In não disponível no Expo Go. Use npx expo run:android.');
      }
      throw e;
    }
  }

  async function verify2FA(temporaryToken: string, code: string) {
    const data = await authService.verify2FA(temporaryToken, code);
    await handleSuccessfulLogin(data);
  }

  async function signUp(name: string, email: string, password: string) {
    const data = await authService.register(name, email, password);
    await handleSuccessfulLogin(data);
  }

  const signOut = useCallback(async () => {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);

    // Sign out from Google if module exists
    if (GoogleSignin) {
      try {
        if (await GoogleSignin.isSignedIn()) {
          await GoogleSignin.signOut();
        }
      } catch (e) {}
    }

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
      showError(e, 'Failed to refresh user data');
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, signIn, signInWithGoogle, verify2FA, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
