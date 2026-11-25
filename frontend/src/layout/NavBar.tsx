'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import { useIsFetching } from '@tanstack/react-query';
import {
  Groups as GroupsIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { tokens } from '@/theme/tokens';
import { useAccount } from '@modules/identity';
import { NotificationBell } from '@modules/notifications';

export default function NavBar() {
  const pathname = usePathname();
  const { currentUser, isLoggedIn, logout } = useAccount();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isFetching = useIsFetching();
  const roles = currentUser?.roles ?? [];
  const canHost = roles.includes('Admin') || roles.includes('Organizer');
  const isAdmin = roles.includes('Admin');

  const navLinkSx = (active: boolean) => ({
    color: active ? tokens.primaryLight : tokens.textSecondary,
    fontWeight: active ? 700 : 600,
    fontSize: '0.9rem',
    px: 1.8,
    py: 0.8,
    borderRadius: '10px',
    bgcolor: active ? `${tokens.primary}1a` : 'transparent',
    '&:hover': {
      color: tokens.textPrimary,
      bgcolor: 'rgba(255,255,255,0.06)',
    },
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundImage: `linear-gradient(135deg, ${tokens.bg}ee 0%, ${tokens.surface}ee 65%, ${tokens.primary}26 100%)`,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 68 }}>
          {/* Left: Brand + Neil-style Primary Nav Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2.5 } }}>
            <Box
              component={Link}
              href="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                textDecoration: 'none',
                color: tokens.textPrimary,
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: tokens.shadowPrimary,
                }}
              >
                <GroupsIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em">
                DevMeet
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button component={Link} href="/activities" sx={navLinkSx(pathname === '/activities')}>
                Activities
              </Button>
              {isLoggedIn && canHost && (
                <Button
                  component={Link}
                  href="/createActivity"
                  sx={navLinkSx(pathname === '/createActivity')}
                >
                  Create Activity
                </Button>
              )}
              {isAdmin && (
                <Button component={Link} href="/admin" sx={navLinkSx(pathname === '/admin')}>
                  Admin
                </Button>
              )}
              <Button component={Link} href="/errors" sx={navLinkSx(pathname === '/errors')}>
                Errors
              </Button>
            </Box>
          </Box>

          {/* Right: SSE Notifications + User Menu / Auth Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {isLoggedIn && currentUser ? (
              <>
                <NotificationBell />
                <Button
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.2,
                    color: tokens.textPrimary,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: '12px',
                    border: `1px solid ${tokens.border}`,
                    bgcolor: tokens.surface2,
                    '&:hover': { borderColor: tokens.borderHover },
                  }}
                >
                  <Avatar
                    src={currentUser.image || '/images/user.png'}
                    alt={currentUser.displayName}
                    sx={{ width: 30, height: 30, border: `1.5px solid ${tokens.primary}` }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ display: { xs: 'none', sm: 'block' } }}
                  >
                    {currentUser.displayName}
                  </Typography>
                </Button>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  slotProps={{ paper: { sx: { minWidth: 210 } } }}
                >
                  <Box sx={{ px: 1.5, py: 0.8 }}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {currentUser.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      @{currentUser.username}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    component={Link}
                    href={`/profiles/${currentUser.username}`}
                    onClick={() => setAnchorEl(null)}
                  >
                    <ListItemIcon><PersonIcon fontSize="small" sx={{ color: tokens.teal }} /></ListItemIcon>
                    My Profile
                  </MenuItem>
                  {canHost && (
                    <MenuItem
                      component={Link}
                      href="/createActivity"
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon><AddIcon fontSize="small" sx={{ color: tokens.primaryLight }} /></ListItemIcon>
                      Create Activity
                    </MenuItem>
                  )}
                  {isAdmin && (
                    <MenuItem
                      component={Link}
                      href="/admin"
                      onClick={() => setAnchorEl(null)}
                    >
                      <ListItemIcon><AdminIcon fontSize="small" sx={{ color: tokens.gold }} /></ListItemIcon>
                      Admin Roles
                    </MenuItem>
                  )}
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(null);
                      logout.mutate();
                    }}
                    sx={{ color: tokens.accent }}
                  >
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: tokens.accent }} /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button component={Link} href="/login" variant="outlined" size="small">
                  Sign In
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  size="small"
                  sx={{
                    background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.teal})`,
                    boxShadow: tokens.shadowPrimary,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${tokens.primaryHover}, ${tokens.tealHover})`,
                    },
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
      {isFetching > 0 && (
        <LinearProgress
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: 'transparent',
            '& .MuiLinearProgress-bar': {
              background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.teal})`,
            },
          }}
        />
      )}
    </AppBar>
  );
}
