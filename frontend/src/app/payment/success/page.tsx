'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Paper, Typography } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  HourglassBottom as PendingIcon,
} from '@mui/icons-material';
import { paymentsApi } from '@modules/payments';
import { tokens } from '@/theme/tokens';

function PaymentSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId');
  const isSandbox = params.get('sandbox') === 'true';
  const [status, setStatus] = useState<'processing' | 'paid' | 'pending' | 'failed'>(
    orderId ? 'processing' : 'paid'
  );
  const ran = useRef(false);

  useEffect(() => {
    if (!orderId || ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function verifyOrder() {
      if (isSandbox) {
        try {
          await paymentsApi.sandboxComplete(orderId!);
          if (!cancelled) setStatus('paid');
        } catch {
          if (!cancelled) setStatus('failed');
        }
        return;
      }

      // Poll backend order status briefly so webhook settlement is verified instead of trusting redirect alone.
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const order = await paymentsApi.getOrderStatus(orderId!);
          if (order.isPaid) {
            if (!cancelled) setStatus('paid');
            return;
          }
          if (order.status === 'Failed' || order.status === 'Refunded') {
            if (!cancelled) setStatus('failed');
            return;
          }
        } catch {
          // Retry briefly on transient errors
        }
        await new Promise((r) => setTimeout(r, 1200));
      }

      if (!cancelled) setStatus('pending');
    }

    verifyOrder();
    return () => {
      cancelled = true;
    };
  }, [isSandbox, orderId]);

  return (
    <Paper
      sx={{
        maxWidth: 520,
        mx: 'auto',
        mt: 6,
        p: 5,
        textAlign: 'center',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {status === 'processing' && (
        <>
          <CircularProgress />
          <Typography variant="h6">Verifying Payment Status...</Typography>
        </>
      )}

      {status === 'paid' && (
        <>
          <CheckCircleIcon sx={{ fontSize: 72, color: tokens.teal }} />
          <Typography variant="h4" fontWeight={800}>
            Ticket Confirmed!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your payment succeeded, your RSVP is automatically registered, and a live SSE notification has been sent!
          </Typography>
          {isSandbox && (
            <Box
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: '10px',
                bgcolor: `${tokens.primary}1a`,
                border: `1px solid ${tokens.primary}44`,
                fontSize: '0.78rem',
                color: tokens.primaryLight,
              }}
            >
              Dev Sandbox Webhook Mode — add Stripe Test Keys in User Secrets for live Stripe Checkout.
            </Box>
          )}
          <Button component={Link} href="/activities" variant="contained" size="large" sx={{ mt: 1 }}>
            Back to Meetups
          </Button>
        </>
      )}

      {status === 'pending' && (
        <>
          <PendingIcon sx={{ fontSize: 72, color: tokens.gold }} />
          <Typography variant="h5" fontWeight={800}>
            Payment Processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your checkout is still awaiting confirmation from Stripe. Your ticket will appear once the webhook completes.
          </Typography>
          <Button component={Link} href="/activities" variant="contained" size="large" sx={{ mt: 1 }}>
            Back to Meetups
          </Button>
        </>
      )}

      {status === 'failed' && (
        <>
          <ErrorOutlineIcon sx={{ fontSize: 72, color: tokens.accent }} />
          <Typography variant="h5" fontWeight={800}>
            Payment Not Completed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We could not verify a completed payment for this order. Please try again or contact support.
          </Typography>
          <Button component={Link} href="/activities" variant="outlined" size="large" sx={{ mt: 1 }}>
            Back to Meetups
          </Button>
        </>
      )}
    </Paper>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
