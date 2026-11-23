'use client';

import Link from 'next/link';
import { Box, Chip, Container, Divider, Typography } from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { tokens } from '@/theme/tokens';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: tokens.surface,
        borderTop: `1px solid ${tokens.border}`,
        mt: 'auto',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${tokens.primary}, ${tokens.teal}, transparent)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1fr 1.5fr',
            },
            gap: { xs: 4, md: 5 },
            py: { xs: 5, md: 6 },
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupsIcon sx={{ color: '#FFFFFF', fontSize: 20 }} />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                DevMeet Egypt
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, lineHeight: 1.7 }}>
              Where Egypt&apos;s top software engineers gather, learn, and build together — powered by .NET 11, Next.js App Router, SignalR, and SSE.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color={tokens.primaryLight} mb={0.5}>
              Platform
            </Typography>
            <Typography component={Link} href="/activities" variant="body2" sx={{ color: tokens.textSecondary, textDecoration: 'none', '&:hover': { color: tokens.primaryLight } }}>
              Explore Meetups
            </Typography>
            <Typography component={Link} href="/createActivity" variant="body2" sx={{ color: tokens.textSecondary, textDecoration: 'none', '&:hover': { color: tokens.primaryLight } }}>
              Host an Event
            </Typography>
            <Typography component={Link} href="/login" variant="body2" sx={{ color: tokens.textSecondary, textDecoration: 'none', '&:hover': { color: tokens.primaryLight } }}>
              Sign In
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} color={tokens.teal} mb={0.5}>
              Tracks
            </Typography>
            <Typography variant="body2" color="text.secondary">Backend & .NET</Typography>
            <Typography variant="body2" color="text.secondary">Frontend & Next.js</Typography>
            <Typography variant="body2" color="text.secondary">DevOps & Cloud</Typography>
            <Typography variant="body2" color="text.secondary">Cybersecurity & Data</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Typography variant="subtitle2" fontWeight={700} color={tokens.primaryLight}>
              Real-Time Stack
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label="SignalR Chat" sx={{ bgcolor: `${tokens.primary}1a`, color: tokens.primaryLight, border: `1px solid ${tokens.primary}44` }} />
              <Chip size="small" label="SSE Notifications" sx={{ bgcolor: `${tokens.teal}1a`, color: tokens.teal, border: `1px solid ${tokens.teal}44` }} />
              <Chip size="small" label="Next.js SSR" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: tokens.textSecondary, border: `1px solid ${tokens.border}` }} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: tokens.border }} />

        <Box sx={{ py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} DevMeet Egypt — لمة مبرمجين. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Built with Clean Architecture • .NET 11 + Next.js 15
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
