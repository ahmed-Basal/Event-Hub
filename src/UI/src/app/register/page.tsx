'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Paper, Typography } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useAccount } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAccount();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { displayName: '', username: '', email: '', password: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register.mutateAsync(values);
      router.push('/activities');
      router.refresh();
    } catch {
      // handled by axios interceptor
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        maxWidth: 460,
        mx: 'auto',
        mt: 4,
        p: 4,
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: tokens.accent }}>
        <PersonAddIcon fontSize="large" />
        <Typography variant="h4" fontWeight={800}>
          Register
        </Typography>
      </Box>

      <FormTextField name="displayName" control={control} label="Display Name" />
      <FormTextField name="username" control={control} label="Username" />
      <FormTextField name="email" control={control} label="Email" type="email" />
      <FormTextField name="password" control={control} label="Password" type="password" />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || register.isPending}>
        {register.isPending ? 'Creating account...' : 'Register'}
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Box component={Link} href="/login" sx={{ color: tokens.primaryLight, fontWeight: 700, textDecoration: 'none' }}>
          Sign in
        </Box>
      </Typography>
    </Paper>
  );
}
