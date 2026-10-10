import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink } from 'react-router';
import { tokens } from '../../../../theme';
import type { User } from '../../../../shared';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          size="small"
          sx={{
            bgcolor: 'rgba(255,255,255,0.04)',
            border: `1px solid ${tokens.border}`,
            width: 38,
            height: 38,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
          }}
        >
          <Badge
            variant="dot"
            sx={{ '& .MuiBadge-dot': { bgcolor: tokens.accent, right: 2, top: 2 } }}
          >
            <NotificationsNoneIcon sx={{ fontSize: 19, color: tokens.textSecondary }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title={user.displayName || 'My Profile'}>
        <Avatar
          onClick={(e) => setAnchorEl(e.currentTarget)}
          src={user.image || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: tokens.primary,
            color: tokens.bg,
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: `2px solid ${tokens.border}`,
            '&:hover': { border: `2px solid ${tokens.primary}` },
            transition: 'border-color 0.2s',
          }}
        >
          {user.displayName?.[0]?.toUpperCase() || 'U'}
        </Avatar>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              bgcolor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              borderRadius: '16px',
              minWidth: 210,
              boxShadow: tokens.shadowDropdown,
              backdropFilter: 'blur(16px)',
              p: 1,
            },
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: tokens.textPrimary }}>
            {user.displayName}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: tokens.textSecondary, mt: 0.2 }}>
            {user.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 0.5, borderColor: tokens.border }} />
        <MenuItem
          component={NavLink}
          to="/createActivity"
          onClick={() => setAnchorEl(null)}
          sx={{ borderRadius: '10px', fontSize: '0.85rem' }}
        >
          <ListItemIcon>
            <AddIcon sx={{ color: tokens.primary, fontSize: 18 }} />
          </ListItemIcon>
          Create Meetup
        </MenuItem>
        <Divider sx={{ my: 0.5, borderColor: tokens.border }} />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onLogout();
          }}
          sx={{
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#ef4444',
          }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: '#ef4444', fontSize: 18 }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}
