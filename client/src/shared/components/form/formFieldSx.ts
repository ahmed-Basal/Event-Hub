import type { SxProps, Theme } from '@mui/material';
import { tokens } from '../../../theme';

/**
 * Standard dark theme field styling for all form components in the design system.
 */
export const formFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '14px',
    backgroundColor: tokens.surface2,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '& fieldset': {
      borderColor: tokens.border,
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: tokens.borderHover,
    },
    '&.Mui-focused fieldset': {
      borderColor: tokens.primary,
      borderWidth: '1.5px',
    },
  },
  '& .MuiInputLabel-root': {
    color: tokens.textSecondary,
    '&.Mui-focused': {
      color: tokens.primary,
    },
  },
  '& .MuiInputBase-input': {
    color: tokens.textPrimary,
    fontSize: '0.95rem',
  },
  '& .MuiFormHelperText-root': {
    color: tokens.textMuted,
    fontSize: '0.78rem',
    mt: 0.8,
  },
};
