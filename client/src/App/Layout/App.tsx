import { Suspense } from 'react';
import { Outlet, useLocation, ScrollRestoration } from 'react-router';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './pages/NavBar';
import Footer from './pages/Footer';
import Spinner from '../../shared/components/feedback/Spinner';
import { tokens } from '../../theme';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Box
      sx={{
        bgcolor: tokens.bg,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ScrollRestoration />
      <NavBar />

      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Suspense fallback={<Spinner message="Loading..." minHeight="60vh" />}>
          {isHome ? (
            <Outlet />
          ) : (
            <Container maxWidth="xl" sx={{ py: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Outlet />
            </Container>
          )}
        </Suspense>
      </Box>

      <Footer />
    </Box>
  );
}
