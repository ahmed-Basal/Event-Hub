import axios from 'axios';
import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { User } from '../types';
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '../schemas/authSchemas';

export interface ForgotPasswordResponse {
  message: string;
  resetUrl?: string;
}

export function extractAuthErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export const accountApi = {
  current: async () => {
    const res = await agent.get<ApiResponse<User>>('/account');
    return res.data.data;
  },
  login: async (data: LoginFormValues) => {
    const res = await axios.post<{ user: User }>('/api/auth/login', data);
    return res.data.user;
  },
  register: async (data: Omit<RegisterFormValues, 'confirmPassword'>) => {
    const res = await axios.post<{ user: User }>('/api/auth/register', data);
    return res.data.user;
  },
  forgotPassword: async (data: ForgotPasswordFormValues) => {
    const res = await axios.post<ForgotPasswordResponse>('/api/auth/forgot-password', data);
    return res.data;
  },
  logout: async () => {
    await axios.post('/api/auth/logout');
  },
};
