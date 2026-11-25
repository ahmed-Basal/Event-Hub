'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PersonAdd as PersonAddIcon,
  RadioButtonUnchecked as UncheckedIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import FormTextField from '@/ui/form/FormTextField';
import FormPasswordField from '@/ui/form/FormPasswordField';
import { tokens } from '@/theme/tokens';
import { extractAuthErrorMessage } from '../api/accountApi';
import { useAccount } from '../hooks/useAccount';
import { registerSchema, type RegisterFormValues } from '../schemas/authSchemas';
import AuthCardLayout from './AuthCardLayout';

const PASSWORD_RULES = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function RegisterForm() {
  const router = useRouter();
  const { register: registerMutation } = useAccount();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';
  const passedCount = PASSWORD_RULES.filter((r) => r.test(passwordValue)).length;
  const strengthPercent = (passedCount / PASSWORD_RULES.length) * 100;
  const strengthColor =
    passedCount <= 2 ? tokens.accent : passedCount <= 4 ? tokens.gold : tokens.teal;

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync({
        displayName: values.displayName,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      toast.success('Account created! Welcome to DevMeet.');
      router.push('/activities');
      router.refresh();
    } catch (error) {
      setServerError(extractAuthErrorMessage(error, 'Could not create your account. Please try again.'));
    }
  };

  return (
    <AuthCardLayout
      title="Create an account"
      subtitle="Join DevMeet Egypt to host tech meetups, build your profile, and connect with developers."
      icon={<PersonAddIcon sx={{ color: '#FFFFFF', fontSize: 25 }} />}
      footer={
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <Typography
            component={Link}
            href="/login"
            variant="body2"
            fontWeight={700}
            sx={{
              color: tokens.primaryLight,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Sign in
          </Typography>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: '12px' }}>
              {serverError}
            </Alert>
          )}

          <FormTextField
            name="displayName"
            control={control}
            label="Display Name"
            placeholder="Ahmed Hassan"
            autoComplete="name"
            autoFocus
          />

          <FormTextField
            name="username"
            control={control}
            label="Username"
            placeholder="ahmed_hassan"
            autoComplete="username"
            helperText="Letters, numbers, dots, underscores, or hyphens"
          />

          <FormTextField
            name="email"
            control={control}
            label="Email Address"
            type="email"
            placeholder="ahmed@example.com"
            autoComplete="email"
          />

          <Box>
            <FormPasswordField
              name="password"
              control={control}
              label="Password"
              placeholder="Create a strong password"
              autoComplete="new-password"
            />

            {passwordValue.length > 0 && (
              <Box sx={{ mt: 1.2 }}>
                <LinearProgress
                  variant="determinate"
                  value={strengthPercent}
                  sx={{
                    height: 5,
                    borderRadius: '999px',
                    bgcolor: tokens.surface2,
                    mb: 1,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strengthColor,
                      borderRadius: '999px',
                      transition: 'all 0.25s ease',
                    },
                  }}
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 0.6,
                  }}
                >
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(passwordValue);
                    return (
                      <Box
                        key={rule.label}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.6,
                          color: ok ? tokens.teal : tokens.textMuted,
                        }}
                      >
                        {ok ? (
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <UncheckedIcon sx={{ fontSize: 14 }} />
                        )}
                        <Typography variant="caption" sx={{ color: 'inherit' }}>
                          {rule.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          <FormPasswordField
            name="confirmPassword"
            control={control}
            label="Confirm Password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            sx={{
              mt: 0.5,
              py: 1.35,
              fontWeight: 700,
              background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
              boxShadow: tokens.shadowPrimary,
              '&:hover': {
                background: `linear-gradient(135deg, ${tokens.primaryHover}, ${tokens.tealHover})`,
              },
            }}
          >
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </Stack>
      </Box>
    </AuthCardLayout>
  );
}
