// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach the host machine's localhost.
// iOS simulator, web, and physical devices use localhost (or your LAN IP).
const getBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    // 10.0.2.2 = host loopback on Android emulator
    // For physical Android device, replace with your machine's LAN IP (e.g. 192.168.x.x)
    return 'http://10.0.2.2:8080';
  }
  // iOS simulator and web both resolve localhost to the host machine
  return 'http://localhost:8080';
};

const BASE_URL = getBaseUrl();

// Called by AuthContext to register its signOut — when tokens expire, we trigger re-login
let onAuthExpired: (() => void) | null = null;
export function setOnAuthExpired(cb: (() => void) | null) {
  onAuthExpired = cb;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401, force logout on 403 (stale/invalid token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never intercept the logout call itself — it creates an infinite loop
    const isLogoutRequest = originalRequest.url?.includes('/auth/logout');
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

    // 403 = token references a non-existent user (DB was reset) or permissions changed
    if (error.response?.status === 403 && !originalRequest._retry && !isLogoutRequest) {
      originalRequest._retry = true;
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      onAuthExpired?.();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        if (!isLogoutRequest) {
          onAuthExpired?.();
        }
      }
    }
    return Promise.reject(error);
  }
);
