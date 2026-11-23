'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Paper, Typography } from '@mui/material';
import { accountApi } from '@features/Account/Frontend';
import { tokens } from '@/theme/tokens';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const code = searchParams.get('code') || '';
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');

  useEffect(() => {
    if (!userId || !code) {
      setStatus('failed');
      return;
    }
    accountApi
      .confirmEmail(userId, code)
      .then(() => setStatus('success'))
      .catch(() => setStatus('failed'));
  }, [userId, code]);

  return (
    <Paper sx={{ maxWidth: 480, mx: 'auto', mt: 6, p: 4, textAlign: 'center', borderRadius: '18px' }}>
      <Typography variant="h5" fontWeight={700} mb={2} color={status === 'success' ? tokens.teal : tokens.accent}>
        {status === 'verifying' && 'Verifying your email...'}
        {status === 'success' && 'Email Confirmed!'}
        {status === 'failed' && 'Verification Failed'}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {status === 'success'
          ? 'Your email has been verified. You can now sign in to DevMeet.'
          : status === 'failed'
            ? 'The confirmation link is invalid or expired.'
            : 'Please wait a moment.'}
      </Typography>
      <Button component={Link} href="/login" variant="contained">
        Go to Login
      </Button>
    </Paper>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
