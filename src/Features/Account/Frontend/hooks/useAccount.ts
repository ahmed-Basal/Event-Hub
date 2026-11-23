'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { accountApi } from '../api/accountApi';
import { useAppStore } from '@/core/store/useAppStore';
import type { User } from '../types';

export const ACCOUNT_QUERY_KEY = ['account', 'current'] as const;

export function useAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
          refreshToken: user.refreshToken ?? prev?.refreshToken,
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

  const loginMutation = useMutation({
    mutationFn: accountApi.login,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, user);
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success(`Welcome back, ${user.displayName}!`);
    },
  });

  const registerMutation = useMutation({
    mutationFn: accountApi.register,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, user);
      toast.success('Account created! Check your email (or dev logs) to confirm.');
    },
  });

  const githubLoginMutation = useMutation({
    mutationFn: accountApi.githubLogin,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, user);
      toast.success(`Signed in with GitHub as ${user.displayName}!`);
      router.push('/activities');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await accountApi.logout(useAppStore.getState().user?.refreshToken);
    },
    onSettled: () => {
      clearUser();
      queryClient.setQueryData(ACCOUNT_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: ['notifications'] });
      router.push('/');
      router.refresh();
    },
  });

  return {
    currentUser,
    isLoggedIn: Boolean(currentUser),
    isLoading,
    login: loginMutation,
    register: registerMutation,
    githubLogin: githubLoginMutation,
    logout: logoutMutation,
  };
}
