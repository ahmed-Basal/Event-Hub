import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { NavLink } from 'react-router';
import type { SxProps, Theme } from '@mui/material';
import { tokens } from '../../../theme';

export interface MenuItemLinkProps {

  to: string;

  children: React.ReactNode;

  icon?: React.ReactNode;

  onClick?: React.MouseEventHandler<HTMLAnchorElement>;

  sx?: SxProps<Theme>;
}

export const MenuItemLink: React.FC<MenuItemLinkProps> = ({
  to,
  children,
  icon,
  onClick,
  sx,
}) => {
  return (
    <MenuItem
      component={NavLink}
      to={to}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        fontSize: '0.95rem',
        fontWeight: 600,
        color: tokens.textSecondary,
        borderRadius: '10px',
        mx: 0.5,
        my: 0.25,
        py: 1,
        px: 1.5,
        transition: 'all 0.2s ease',
        textDecoration: 'none',
        '&:hover': {
          color: tokens.textPrimary,
          bgcolor: 'rgba(255, 255, 255, 0.06)',
        },
        '&.active': {
          color: tokens.primary,
          fontWeight: 700,
          bgcolor: 'rgba(245, 158, 11, 0.1)',
        },
        ...sx,
      }}
    >
      {icon && (
        <Box
          component="span"
          sx={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.1rem',
            color: 'inherit',
          }}
        >
          {icon}
        </Box>
      )}
      {children}
    </MenuItem>
  );
};

export default MenuItemLink;
