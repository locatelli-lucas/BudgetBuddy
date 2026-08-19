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
  requires2FA?: boolean;
  temporaryToken?: string;
  backupCodes?: string[];
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string; // Base64 Data URI
}
