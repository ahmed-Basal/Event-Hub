'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Box, Container } from '@mui/material';
import NavBar from './NavBar';
import Footer from './Footer';
import { tokens } from '@/theme/tokens';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: tokens.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NavBar />
      {isHome ? (
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      ) : (
        <Container maxWidth="xl" component="main" sx={{ flex: 1, mt: 3.5, pb: 8 }}>
          {children}
        </Container>
      )}
      <Footer />
    </Box>
  );
}
