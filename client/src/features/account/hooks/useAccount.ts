import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { accountApi } from '../api/accountApi';
import { accountKeys } from '../api/accountKeys';
import type { User } from '../../../shared';
import type { LoginSchema, RegisterSchema } from '../schemas';
import config from '../../../config';

export function useAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    data: currentUser,
    isLoading,
    isPending,
  } = useQuery<User | null>({
    queryKey: accountKeys.currentUser(),
    queryFn: async () => {
      // First check if token/user cached in localStorage or cookie exists
      const stored = localStorage.getItem(config.storage.userKey);
      const user = await accountApi.currentUser();
      if (user) {
        localStorage.setItem(config.storage.userKey, JSON.stringify(user));
        return user;
      }
      if (stored) {
        try {
          return JSON.parse(stored) as User;
        } catch {
          localStorage.removeItem(config.storage.userKey);
        }
      }
      return null;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (creds: LoginSchema) => accountApi.login(creds),
    onSuccess: (user) => {
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));
      queryClient.setQueryData(accountKeys.currentUser(), user);
      toast.success(`Welcome back, ${user.displayName}! 👋`);
      const from = (location.state as any)?.from?.pathname || '/activities';
      navigate(from, { replace: true });
    },
    onError: (err: any) => {
      const msg = Array.isArray(err)
        ? err.join(', ')
        : err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (creds: RegisterSchema) => accountApi.register(creds),
    onSuccess: (user) => {
      localStorage.setItem(config.storage.userKey, JSON.stringify(user));
      queryClient.setQueryData(accountKeys.currentUser(), user);
      toast.success(`Account created successfully! Welcome, ${user.displayName}! 🚀`);
      navigate('/activities', { replace: true });
    },
    onError: (err: any) => {
      const msg = Array.isArray(err)
        ? err.join(', ')
        : err?.response?.data?.message || err?.message || 'Registration failed.';
      toast.error(msg);
    },
  });

  const logout = async () => {
    await accountApi.logout();
    localStorage.removeItem(config.storage.userKey);
    queryClient.setQueryData(accountKeys.currentUser(), null);
    queryClient.invalidateQueries({ queryKey: accountKeys.all });
    toast.info('Logged out successfully');
    navigate('/', { replace: true });
  };

  return {
    currentUser,
    isLoggedIn: Boolean(currentUser),
    isLoading: isLoading || isPending,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
  };
}

export default useAccount;
