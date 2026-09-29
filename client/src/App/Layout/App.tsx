import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './NavBar';
import Footer from './Footer';
import { Outlet, useLocation } from 'react-router';
import { tokens } from '../../theme';

function App() {
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
      {isHome ? (
        <Outlet />
      ) : (
        <>
          <NavBar />
          <Box sx={{ flex: 1 }}>
            <Container maxWidth="xl" sx={{ mt: 3 }}>
              <Outlet />
            </Container>
          </Box>
          <Footer />
        </>
      )}
    </Box>
  );
}

export default App;
