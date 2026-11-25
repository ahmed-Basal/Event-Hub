'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LockReset as LockResetIcon,
  MarkEmailRead as MarkEmailReadIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import FormTextField from '@/ui/form/FormTextField';
import { tokens } from '@/theme/tokens';
import {
  accountApi,
  extractAuthErrorMessage,
  type ForgotPasswordResponse,
} from '../api/accountApi';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/authSchemas';
import AuthCardLayout from './AuthCardLayout';

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [responseInfo, setResponseInfo] = useState<ForgotPasswordResponse | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      const res = await accountApi.forgotPassword(values);
      setSubmittedEmail(values.email);
      setResponseInfo(res);
    } catch (error) {
      setServerError(
        extractAuthErrorMessage(error, 'Could not process password reset request. Please try again.')
      );
    }
  };

  const handleTryAnother = () => {
    setSubmittedEmail(null);
    setResponseInfo(null);
    setServerError(null);
    reset({ email: '' });
  };

  return (
    <AuthCardLayout
      title={submittedEmail ? 'Check your email' : 'Forgot password?'}
      subtitle={
        submittedEmail
          ? `We processed a password reset request for ${submittedEmail}.`
          : 'Enter your email address and we will send you instructions to reset your password.'
      }
      icon={
        submittedEmail ? (
          <MarkEmailReadIcon sx={{ color: '#FFFFFF', fontSize: 25 }} />
        ) : (
          <LockResetIcon sx={{ color: '#FFFFFF', fontSize: 25 }} />
        )
      }
      footer={
        <Button
          component={Link}
          href="/login"
          startIcon={<ArrowBackIcon fontSize="small" />}
          sx={{ color: tokens.textSecondary, '&:hover': { color: tokens.primaryLight } }}
        >
          Back to Sign in
        </Button>
      }
    >
      {submittedEmail && responseInfo ? (
        <Stack spacing={2.2}>
          <Alert severity="success" sx={{ borderRadius: '12px' }}>
            {responseInfo.message}
          </Alert>

          {responseInfo.resetUrl && (
            <Button
              component="a"
              href={responseInfo.resetUrl}
              variant="contained"
              size="large"
              endIcon={<OpenInNewIcon fontSize="small" />}
              sx={{
                py: 1.3,
                fontWeight: 700,
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
                boxShadow: tokens.shadowPrimary,
              }}
            >
              Reset Password via Keycloak
            </Button>
          )}

          <Button variant="outlined" size="large" onClick={handleTryAnother}>
            Try another email
          </Button>
        </Stack>
      ) : (
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
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />

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
              {isSubmitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <Typography component="span" fontWeight={700}>
                  Send Reset Link
                </Typography>
              )}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthCardLayout>
  );
}
