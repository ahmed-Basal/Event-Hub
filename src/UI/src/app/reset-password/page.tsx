'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Paper, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { accountApi } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';

const schema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const code = params.get('code') || '';

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await accountApi.resetPassword({ email, resetCode: code, newPassword: values.newPassword });
    toast.success('Password reset successfully! Please sign in.');
    router.push('/login');
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 460, mx: 'auto', mt: 6, p: 4, borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Typography variant="h5" fontWeight={700} color={tokens.accent}>
        Reset Password
      </Typography>
      <FormTextField name="newPassword" control={control} label="New Password" type="password" />
      <Button type="submit" variant="contained" disabled={isSubmitting || !email || !code}>
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>
    </Paper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
