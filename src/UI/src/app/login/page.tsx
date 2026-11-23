'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { GitHub as GitHubIcon, LockOpen as LockOpenIcon } from '@mui/icons-material';
import { useAccount } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';
import FormTextField from '@/ui/form/FormTextField';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAccount();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login.mutateAsync(values);
      router.push(user.roles?.includes('Admin') ? '/admin' : '/activities');
      router.refresh();
    } catch {
      // handled by axios interceptor
    }
  };

  const handleGitHubLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!clientId) {
      window.location.href = '/auth-callback';
      return;
    }
    const redirectUri = `${window.location.origin}/auth-callback`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: tokens.primaryLight }}>
        <LockOpenIcon fontSize="large" />
        <Typography variant="h4" fontWeight={800}>
          Sign in
        </Typography>
      </Box>

      <Button
        component="a"
        href="/api/auth/login"
        variant="contained"
        color="secondary"
        size="large"
      >
        Sign in with Keycloak (SSO / MFA)
      </Button>

      <Divider>OR LEGACY CREDENTIALS</Divider>

      <FormTextField name="email" control={control} label="Email" type="email" />
      <FormTextField name="password" control={control} label="Password" type="password" />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting || login.isPending}>
        {login.isPending ? 'Signing in...' : 'Login'}
      </Button>

      <Divider>OR</Divider>

      <Button
        variant="outlined"
        size="large"
        startIcon={<GitHubIcon />}
        onClick={handleGitHubLogin}
      >
        Sign in with GitHub
      </Button>

      <Divider>DEMO QUICK LOGIN</Divider>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {[
          { label: 'Organizer (Tarek)', email: 'tarek.mostafa@devmeet.com' },
          { label: 'Member (Salma)', email: 'salma.hassan@devmeet.com' },
        ].map((demo) => (
          <Button
            key={demo.label}
            size="small"
            variant="outlined"
            disabled={login.isPending}
            onClick={async () => {
              try {
                await login.mutateAsync({ email: demo.email, password: 'Pa$$w0rd' });
                router.push('/activities');
                router.refresh();
              } catch {
                // handled by interceptor
              }
            }}
            sx={{ flex: 1, fontSize: '0.78rem' }}
          >
            {demo.label}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <Box component={Link} href="/forgot-password" sx={{ color: tokens.teal, textDecoration: 'none' }}>
            Forgot password?
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          New here?{' '}
          <Box component={Link} href="/register" sx={{ color: tokens.primaryLight, fontWeight: 700, textDecoration: 'none' }}>
            Register
          </Box>
        </Typography>
      </Box>
    </Paper>
  );
}
