'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { LockOpen as LockOpenIcon, VpnKey as KeyIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import FormTextField from '@/ui/form/FormTextField';
import FormPasswordField from '@/ui/form/FormPasswordField';
import { tokens } from '@/theme/tokens';
import { extractAuthErrorMessage } from '../api/accountApi';
import { useAccount } from '../hooks/useAccount';
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas';
import AuthCardLayout from './AuthCardLayout';

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: 'The SSO sign-in response was incomplete. Please try again.',
  state_mismatch: 'Your sign-in session expired or could not be verified. Please try again.',
  token_exchange_failed: 'Could not complete Keycloak authentication. Please try again.',
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAccount();

  const rawReturnTo = searchParams.get('returnTo');
  const returnTo = rawReturnTo && rawReturnTo.startsWith('/') ? rawReturnTo : '/activities';
  const queryError = searchParams.get('error');

  const [serverError, setServerError] = useState<string | null>(
    queryError ? (CALLBACK_ERROR_MESSAGES[queryError] ?? 'Authentication failed. Please try again.') : null
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login.mutateAsync(values);
      toast.success(`Welcome back, ${user.displayName}!`);
      router.push(returnTo);
      router.refresh();
    } catch (error) {
      setServerError(extractAuthErrorMessage(error, 'Invalid email/username or password.'));
    }
  };

  const ssoHref = `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Sign in to manage your DevMeet profile, RSVP to events, and join discussions."
      icon={<LockOpenIcon sx={{ color: '#FFFFFF', fontSize: 25 }} />}
      footer={
        <Typography variant="body2" color="text.secondary">
          Don&apos;t have an account?{' '}
          <Typography
            component={Link}
            href="/register"
            variant="body2"
            fontWeight={700}
            sx={{
              color: tokens.primaryLight,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Create one
          </Typography>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.2}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {serverError}
            </Alert>
          )}

          <FormTextField
            name="email"
            control={control}
            label="Email or Username"
            placeholder="you@example.com or username"
            autoComplete="username"
            autoFocus
          />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.6 }}>
              <Typography
                component={Link}
                href="/forgot-password"
                variant="caption"
                fontWeight={600}
                sx={{
                  color: tokens.primaryLight,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Typography>
            </Box>
            <FormPasswordField
              name="password"
              control={control}
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              py: 1.35,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
              boxShadow: tokens.shadowPrimary,
              '&:hover': {
                background: `linear-gradient(135deg, ${tokens.primaryHover}, ${tokens.tealHover})`,
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
          </Button>

          <Divider>
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
              OR
            </Typography>
          </Divider>

          <Button
            component="a"
            href={ssoHref}
            variant="outlined"
            size="large"
            startIcon={<KeyIcon fontSize="small" />}
            sx={{ py: 1.2 }}
          >
            Continue with Keycloak SSO / OTP
          </Button>
        </Stack>
      </Box>
    </AuthCardLayout>
  );
}
