import { agent } from '@/core/api/client';
import type { ApiResponse } from '@/core/api/types';
import type { User } from '../types';

export const accountApi = {
  current: async () => {
    const res = await agent.get<ApiResponse<User>>('/account');
    return res.data.data;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await agent.post<ApiResponse<User>>('/account/login', payload);
    return res.data.data;
  },
  register: async (payload: {
    displayName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const res = await agent.post<ApiResponse<User>>('/account/register', payload);
    return res.data.data;
  },
  logout: async (refreshToken?: string) => {
    await agent.post('/account/logout', { refreshToken: refreshToken || '' });
  },
  confirmEmail: async (userId: string, code: string) => {
    const res = await agent.get<ApiResponse<string>>('/account/confirm-email', {
      params: { userId, code },
    });
    return res.data;
  },
  resendConfirmEmail: async (email: string) => {
    const res = await agent.post<ApiResponse<string>>('/account/resend-confirm-email', { email });
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await agent.post<ApiResponse<string>>('/account/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (payload: { email: string; resetCode: string; newPassword: string }) => {
    const res = await agent.post<ApiResponse<string>>('/account/reset-password', payload);
    return res.data;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await agent.post<ApiResponse<string>>('/account/change-password', payload);
    return res.data;
  },
  githubLogin: async (code: string) => {
    const res = await agent.post<ApiResponse<User>>('/account/github-login', { code });
    return res.data.data;
  },
};
