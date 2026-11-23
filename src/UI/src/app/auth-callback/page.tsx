'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircularProgress, Paper, Typography } from '@mui/material';
import { useAccount } from '@features/Account/Frontend';

function AuthCallbackContent() {
  const params = useSearchParams();
  const code = params.get('code');
  const { githubLogin } = useAccount();
  const fetched = useRef(false);

  useEffect(() => {
    if (!code || fetched.current) return;
    fetched.current = true;
    githubLogin.mutate(code);
  }, [code, githubLogin]);

  return (
    <Paper sx={{ maxWidth: 420, mx: 'auto', mt: 8, p: 5, textAlign: 'center', borderRadius: '18px' }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="h6">
        {code ? 'Completing GitHub Sign-In...' : 'GitHub OAuth Client ID not configured.'}
      </Typography>
    </Paper>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  );
}
