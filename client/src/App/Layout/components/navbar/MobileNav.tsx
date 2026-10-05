import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItemLink from './MenuItemLink';
import { tokens } from '../../../../theme';
import type { User } from '../../../../shared';

interface MobileNavProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

export default function MobileNav({ isLoggedIn, currentUser, onLogout }: MobileNavProps) {
  const [mobileAnchor, setMobileAnchor] = useState<null | HTMLElement>(null);

  const handleClose = () => setMobileAnchor(null);

  return (
    <>
      <IconButton
        sx={{ display: { xs: 'flex', md: 'none' }, color: tokens.textSecondary }}
        onClick={(e) => setMobileAnchor(e.currentTarget)}
      >
        <MenuIcon />
      </IconButton>

      <Menu
        anchorEl={mobileAnchor}
        open={Boolean(mobileAnchor)}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              bgcolor: tokens.surface2,
              border: `1px solid ${tokens.border}`,
              borderRadius: '14px',
              minWidth: 200,
              p: 0.5,
            },
          },
        }}
      >
        <MenuItemLink to="/" onClick={handleClose}>
          Home
        </MenuItemLink>
        <MenuItemLink to="/activities" onClick={handleClose}>
          Explore
        </MenuItemLink>
        <MenuItemLink to="/errors" onClick={handleClose}>
          Errors
        </MenuItemLink>
        {isLoggedIn ? (
          <>
            <MenuItemLink to="/createActivity" onClick={handleClose}>
              Create Meetup
            </MenuItemLink>
            <Divider sx={{ my: 0.5, borderColor: tokens.border }} />
            <MenuItem
              onClick={() => {
                handleClose();
                onLogout();
              }}
              sx={{ color: '#ef4444', fontSize: '0.875rem' }}
            >
              Sign Out ({currentUser?.displayName})
            </MenuItem>
          </>
        ) : (
          <>
            <Divider sx={{ my: 0.5, borderColor: tokens.border }} />
            <MenuItemLink to="/login" onClick={handleClose}>
              Sign In
            </MenuItemLink>
            <MenuItemLink to="/register" onClick={handleClose}>
              Sign Up
            </MenuItemLink>
          </>
        )}
      </Menu>
    </>
  );
}
