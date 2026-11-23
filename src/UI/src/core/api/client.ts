import axios, { type AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { useAppStore } from '@/core/store/useAppStore';
import type { User } from '@features/Account/Frontend/types';

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
  baseURL: API_URL,
  withCredentials: true,
});

agent.interceptors.request.use((reqConfig) => {
  const user = getStoredUser();
  if (user?.token) {
    reqConfig.headers.Authorization = `Bearer ${user.token}`;
  }
  return reqConfig;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const currentUser = getStoredUser();
      const refreshToken = currentUser?.refreshToken;
      if (!refreshToken) return null;

      const res = await axios.post<{ succeeded: boolean; data?: User }>(
        `${API_URL}/account/refresh-token`,
        { refreshToken },
        { withCredentials: true }
      );

      if (res.data?.succeeded && res.data.data) {
        setStoredUser(res.data.data);
        return res.data.data.token ?? null;
      }
      return null;
    } catch {
      setStoredUser(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

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
    const originalRequest = config as typeof config & { _retry?: boolean };

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/account/login') &&
      !originalRequest?.url?.includes('/account/register') &&
      !originalRequest?.url?.includes('/account/refresh-token')
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return agent(originalRequest);
      }
    }

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
