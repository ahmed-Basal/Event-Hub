'use client';

import Link from 'next/link';
import { Button, Paper, Typography } from '@mui/material';
import { SearchOff as SearchOffIcon } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

export default function NotFoundPage() {
  return (
    <Paper
      sx={{
        maxWidth: 520,
        mx: 'auto',
        mt: 8,
        p: 6,
        textAlign: 'center',
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: tokens.primaryLight }} />
      <Typography variant="h4" fontWeight={800}>
        Oops — we couldn&apos;t find that!
      </Typography>
      <Button component={Link} href="/activities" variant="contained" size="large" sx={{ mt: 1 }}>
        Return to Activities
      </Button>
    </Paper>
  );
}
