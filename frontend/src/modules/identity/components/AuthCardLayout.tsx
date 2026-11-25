'use client';

import type { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

interface AuthCardLayoutProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthCardLayout({
  title,
  subtitle,
  icon,
  children,
  footer,
}: AuthCardLayoutProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 220px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 5 },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle 520px at 35% 25%, rgba(14, 165, 233, 0.14) 0%, transparent 65%),
            radial-gradient(circle 460px at 65% 75%, rgba(20, 184, 166, 0.12) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }}
      />

      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          p: { xs: 3, sm: 4.5 },
          borderRadius: '20px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1.2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: tokens.shadowPrimary,
                mb: 0.5,
              }}
            >
              {icon ?? <GroupsIcon sx={{ color: '#FFFFFF', fontSize: 26 }} />}
            </Box>
            <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              {subtitle}
            </Typography>
          </Stack>

          {children}

          {footer && (
            <Box sx={{ pt: 0.5, textAlign: 'center' }}>
              {footer}
            </Box>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
