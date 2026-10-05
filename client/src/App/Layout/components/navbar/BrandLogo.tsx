import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router';
import { tokens } from '../../../../theme';

export default function BrandLogo() {
  return (
    <Box
      component={NavLink}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.2,
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '14px',
          bgcolor: tokens.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: tokens.shadowGold,
          fontSize: '1.15rem',
          fontWeight: 900,
          color: tokens.bg,
          fontFamily: 'monospace',
          letterSpacing: '-1px',
          userSelect: 'none',
          position: 'relative',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'scale(1.05)' },
        }}
      >
        {'</>'}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: tokens.accent,
            boxShadow: tokens.shadowCoral,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '-2px', lineHeight: 1 }}>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: tokens.textPrimary,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          لمه مبرمجين
        </Typography>
        <Typography
          sx={{
            fontSize: '0.62rem',
            fontWeight: 700,
            color: tokens.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            lineHeight: 1,
          }}
        >
          Egypt 🇪🇬
        </Typography>
      </Box>
    </Box>
  );
}
