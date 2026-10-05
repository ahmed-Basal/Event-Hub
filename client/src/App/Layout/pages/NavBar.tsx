import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import { NavLink } from 'react-router';
import { tokens } from '../../../theme';
import { useAccount } from '../../../features/account';
import { BrandLogo, CitySelector, SearchBar, AuthButtons, UserMenu, MobileNav } from '../components/navbar';

export default function NavBar() {
  const { currentUser, isLoggedIn, logout } = useAccount();

  return (
    <AppBar position="sticky" elevation={0}>
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            py: 1,
            minHeight: { xs: 64, md: 72 },
          }}
        >
          {/* Brand Logo */}
          <BrandLogo />

          {/* City Quick Selector */}
          <CitySelector />

          {/* Search Input */}
          <SearchBar />

          {/* Navigation & User Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              component={NavLink}
              to="/activities"
              variant="text"
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: tokens.textSecondary,
                px: 1.5,
                fontSize: '0.875rem',
                '&.active': { color: tokens.primary },
                '&:hover': { color: tokens.textPrimary, bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Explore
            </Button>

            <Button
              component={NavLink}
              to="/errors"
              variant="text"
              sx={{
                display: { xs: 'none', md: 'flex' },
                color: tokens.textSecondary,
                px: 1.5,
                fontSize: '0.875rem',
                '&.active': { color: tokens.primary },
                '&:hover': { color: tokens.textPrimary, bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Errors
            </Button>

            {isLoggedIn && (
              <Button
                component={NavLink}
                to="/createActivity"
                variant="contained"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  bgcolor: tokens.primary,
                  color: tokens.bg,
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.7,
                  boxShadow: tokens.shadowGold,
                  '&:hover': { bgcolor: '#e08e0a' },
                }}
              >
                Create Meetup
              </Button>
            )}

            {/* Authenticated User Menu or Guest Auth Buttons */}
            {isLoggedIn && currentUser ? (
              <UserMenu user={currentUser} onLogout={logout} />
            ) : (
              <AuthButtons />
            )}

            {/* Mobile Navigation Drawer */}
            <MobileNav
              isLoggedIn={isLoggedIn}
              currentUser={currentUser ?? null}
              onLogout={logout}
            />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
