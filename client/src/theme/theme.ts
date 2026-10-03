import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
    teal: Palette['primary'];
    custom: {
      surface: string;
      surface2: string;
      surface3: string;
      border: string;
      borderHover: string;
      textMuted: string;
    };
  }

  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
    teal?: PaletteOptions['primary'];
    custom?: {
      surface?: string;
      surface2?: string;
      surface3?: string;
      border?: string;
      borderHover?: string;
      textMuted?: string;
    };
  }

  interface Theme {
    customShadows: {
      gold: string;
      coral: string;
      card: string;
      dropdown: string;
    };
  }

  interface ThemeOptions {
    customShadows?: {
      gold?: string;
      coral?: string;
      card?: string;
      dropdown?: string;
    };
  }
}

import { tokens, type DesignTokens } from './tokens';
export { tokens, type DesignTokens };

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: tokens.bg,
      paper: tokens.surface,
    },
    primary: {
      main: tokens.primary,
      contrastText: tokens.bg,
      light: '#FBBF24',
      dark: '#D97706',
    },
    secondary: {
      main: tokens.accent,
      contrastText: '#FFFFFF',
      light: '#FF707E',
      dark: '#E03042',
    },
    accent: {
      main: tokens.accent,
      contrastText: '#FFFFFF',
      light: '#FF707E',
      dark: '#E03042',
    },
    teal: {
      main: tokens.teal,
      contrastText: tokens.bg,
      light: '#22D3EE',
      dark: '#0891B2',
    },
    info: {
      main: tokens.teal,
    },
    text: {
      primary: tokens.textPrimary,
      secondary: tokens.textSecondary,
      disabled: tokens.textMuted,
    },
    divider: tokens.border,
    error: {
      main: tokens.accent,
    },
    custom: {
      surface: tokens.surface,
      surface2: tokens.surface2,
      surface3: tokens.surface3,
      border: tokens.border,
      borderHover: tokens.borderHover,
      textMuted: tokens.textMuted,
    },
  },
  customShadows: {
    gold: tokens.shadowGold,
    coral: tokens.shadowCoral,
    card: tokens.shadowCard,
    dropdown: tokens.shadowDropdown,
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 600 },
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
          scrollbarColor: `${tokens.surface2} ${tokens.bg}`,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: tokens.bg },
          '&::-webkit-scrollbar-thumb': {
            background: tokens.surface2,
            borderRadius: '3px',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${tokens.bg}cc`,
          backdropFilter: 'blur(12px)',
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
          borderRadius: '18px',
          backgroundImage: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0px 24px 50px 0px rgba(0, 0, 0, 0.45)',
            borderColor: tokens.borderHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '9px 22px',
          transition: 'all 0.2s ease-in-out',
          '&.MuiButton-containedPrimary': {
            backgroundColor: tokens.primary,
            color: tokens.bg,
            boxShadow: tokens.shadowGold,
            '&:hover': {
              backgroundColor: '#e08e0a',
              boxShadow: '0px 12px 40px 0px rgba(245, 158, 11, 0.36)',
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: tokens.accent,
            boxShadow: tokens.shadowCoral,
            '&:hover': {
              backgroundColor: '#e03042',
              boxShadow: '0px 12px 40px 0px rgba(255, 70, 85, 0.55)',
            },
          },
        },
        outlined: {
          borderColor: tokens.border,
          color: tokens.textPrimary,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '&:hover': {
            borderColor: tokens.borderHover,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surface2,
          color: tokens.textPrimary,
          border: `1px solid ${tokens.border}`,
          backdropFilter: 'blur(8px)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: 500,
          boxShadow: tokens.shadowDropdown,
        },
        arrow: {
          color: tokens.surface2,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '9999px',
          fontWeight: 600,
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
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
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: '20px',
          boxShadow: '0px 24px 60px 0px rgba(0, 0, 0, 0.6)',
          backgroundImage: 'none',
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
          backgroundImage: 'none',
          padding: '6px',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontSize: '0.875rem',
          transition: 'all 0.15s ease',
          '&.Mui-selected': {
            backgroundColor: `${tokens.primary}22`,
            color: tokens.primary,
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '9999px',
            backgroundColor: tokens.surface3,
            '& fieldset': { borderColor: tokens.border },
            '&:hover fieldset': { borderColor: tokens.borderHover },
            '&.Mui-focused fieldset': { borderColor: tokens.primary },
          },
        },
      },
    },
  },
});

export const lammaMubarmegeen = theme;
export default theme;
