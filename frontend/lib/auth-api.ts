import { api } from './api-client';
import type {
  SignupData,
  LoginData,
  AuthResponse,
} from '@/types/user';

export const authApi = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/signup", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getCurrentUser: async (): Promise<AuthResponse | null> => {
    try {
      const response = await api.get<AuthResponse>("/auth/me");

      return response.data;
    } catch {
      return null;
    }
  },

  verifyEmail: async (token: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/verify-email", {
      token,
    });
    return response.data;
  },

  resendVerification: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/resend-verification",
      { email }
    );
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>(
      "/auth/reset-password",
      { token, password }
    );
    return response.data;
  },
};
