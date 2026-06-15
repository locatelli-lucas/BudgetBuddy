// src/types/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  premium: boolean;
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string; // Token used to verify OTP if enabled
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
}
