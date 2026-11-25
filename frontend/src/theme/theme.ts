'use client';

import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export { tokens };

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: tokens.bg,
      paper: tokens.surface,
    },
    primary: {
      main: tokens.primary,
      light: tokens.primaryLight,
      dark: tokens.primaryHover,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: tokens.accent,
      light: '#F472B6',
      dark: tokens.accentHover,
      contrastText: '#FFFFFF',
    },
    info: {
      main: tokens.teal,
      contrastText: tokens.bg,
    },
    success: {
      main: tokens.teal,
    },
    warning: {
      main: tokens.gold,
    },
    error: {
      main: tokens.accent,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled: tokens.textMuted,
    },
    divider: tokens.border,
  },
  typography: {
    fontFamily: "var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    caption: { color: tokens.textMuted },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.bg,
          color: tokens.textPrimary,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${tokens.bg}dd`,
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${tokens.border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
          borderRadius: '16px',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface,
          backgroundImage: 'none',
          border: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          '&.MuiButton-containedPrimary': {
            backgroundColor: tokens.primary,
            color: '#FFFFFF',
            boxShadow: tokens.shadowPrimary,
            '&:hover': {
              backgroundColor: tokens.primaryHover,
              transform: 'translateY(-1px)',
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: tokens.accent,
            color: '#FFFFFF',
            boxShadow: tokens.shadowCoral,
            '&:hover': {
              backgroundColor: tokens.accentHover,
              transform: 'translateY(-1px)',
            },
          },
        },
        outlined: {
          borderColor: tokens.border,
          color: tokens.textPrimary,
          '&:hover': {
            borderColor: tokens.borderHover,
            backgroundColor: 'rgba(14, 165, 233, 0.1)',
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: '14px',
          boxShadow: tokens.shadowDropdown,
          padding: '6px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&.Mui-selected': {
            backgroundColor: `${tokens.primary}22`,
            color: tokens.primaryLight,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: tokens.surface2,
            '& fieldset': { borderColor: tokens.border },
            '&:hover fieldset': { borderColor: tokens.borderHover },
            '&.Mui-focused fieldset': { borderColor: tokens.primary },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 600,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: tokens.border,
        },
      },
    },
  },
});

export default theme;
