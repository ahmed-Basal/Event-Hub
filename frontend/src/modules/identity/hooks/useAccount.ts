'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi } from '../api/accountApi';
import { useAppStore } from '@/core/store/useAppStore';
import type { User } from '../types';
import type { LoginFormValues, RegisterFormValues } from '../schemas/authSchemas';

export const ACCOUNT_QUERY_KEY = ['account', 'current'] as const;

export function useAccount() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const storedUser = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const clearUser = useAppStore((s) => s.clearUser);

  const { data: fetchedUser, isLoading } = useQuery<User | null>({
    queryKey: ACCOUNT_QUERY_KEY,
    queryFn: async () => {
      try {
        const user = await accountApi.current();
        const prev = useAppStore.getState().user;
        const merged: User = {
          ...user,
          token: user.token ?? prev?.token,
        };
        setUser(merged);
        return merged;
      } catch {
        clearUser();
        return null;
      }
    },
    initialData: () => useAppStore.getState().user,
    initialDataUpdatedAt: () => (useAppStore.getState().user?.roles ? Date.now() : 0),
    staleTime: 60_000,
  });

  const currentUser = fetchedUser ?? storedUser ?? null;

  const applyAuthenticatedUser = (user: User) => {
    setUser(user);
    queryClient.setQueryData(ACCOUNT_QUERY_KEY, user);
    queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEY });
  };

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => accountApi.login(values),
    onSuccess: applyAuthenticatedUser,
  });

  const registerMutation = useMutation({
    mutationFn: (values: Omit<RegisterFormValues, 'confirmPassword'>) =>
      accountApi.register(values),
    onSuccess: applyAuthenticatedUser,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await accountApi.logout();
    },
    onSettled: () => {
      clearUser();
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ['notifications'] });
      router.push('/login');
      router.refresh();
    },
  });

  return {
    currentUser,
    isLoggedIn: Boolean(currentUser),
    isLoading,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
  };
}
