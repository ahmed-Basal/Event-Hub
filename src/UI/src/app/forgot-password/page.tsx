'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Paper, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { accountApi } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await accountApi.forgotPassword(values.email);
    toast.success('If an account exists, a reset link has been sent (check dev logs if local).');
    reset();
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ maxWidth: 460, mx: 'auto', mt: 6, p: 4, borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Typography variant="h5" fontWeight={700} color={tokens.primaryLight}>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Enter your email address and we will send you a password reset link.
      </Typography>
      <FormTextField name="email" control={control} label="Email" type="email" />
      <Button type="submit" variant="contained" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </Paper>
  );
}
