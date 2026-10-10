import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { NavLink } from 'react-router';
import { tokens } from '../../../../theme';

export default function AuthButtons() {
  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      <Button
        component={NavLink}
        to="/login"
        variant="outlined"
        sx={{
          color: tokens.textPrimary,
          borderColor: tokens.border,
          borderRadius: '10px',
          px: 2,
          py: 0.6,
          fontSize: '0.82rem',
          fontWeight: 600,
          '&:hover': {
            borderColor: tokens.primary,
            bgcolor: 'rgba(238, 155, 0, 0.08)',
          },
        }}
      >
        Sign In
      </Button>
      <Button
        component={NavLink}
        to="/register"
        variant="contained"
        sx={{
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
        Sign Up
      </Button>
    </Box>
  );
}
