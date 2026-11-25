import axios, { type AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useAppStore } from '@/core/store/useAppStore';
import type { User } from '@modules/identity/types';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7223/api';

export const HUB_URL =
  process.env.NEXT_PUBLIC_HUB_URL || 'https://localhost:7223/comments';

export const USER_STORAGE_KEY = 'devmeet_user';

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  return useAppStore.getState().user;
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  useAppStore.getState().setUser(user);
}

export const agent = axios.create({
  baseURL: '/api/proxy',
  withCredentials: true,
});

agent.interceptors.request.use((reqConfig) => {
  const user = getStoredUser();
  if (user?.token) {
    reqConfig.headers.Authorization = `Bearer ${user.token}`;
  }
  return reqConfig;
});

agent.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (!error.response) {
      if (typeof window !== 'undefined') {
        toast.error('Cannot connect to DevMeet API. Make sure the backend is running.');
      }
      return Promise.reject(error);
    }

    const { status, data, config } = error.response;

    if (status === 400 && data?.errors) {
      const messages: string[] = Array.isArray(data.errors)
        ? data.errors
        : Object.values(data.errors).flat().map(String);
      if (messages.length > 0) {
        toast.error(messages[0]);
      }
    } else if (status === 401) {
      const isAuthCheck = config?.url?.endsWith('/account') || config?.url === '/account';
      if (!isAuthCheck) {
        toast.error(data?.message || 'Please sign in to continue.');
      }
    } else if (status === 403) {
      toast.error(data?.message || 'Forbidden: only the host can perform this action.');
    } else if (status === 404 && config?.method !== 'get') {
      toast.error(data?.message || 'Resource not found.');
    } else if (status >= 500) {
      toast.error(data?.message || 'Server error occurred.');
    }

    return Promise.reject(error);
  }
);
