import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { tokens } from '../../../theme';

export interface EmptyStateProps {

  icon?: React.ReactNode;

  title: string;

  message?: string;

  action?: React.ReactNode;

  minHeight?: number | string;

  sx?: SxProps<Theme>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '🎭',
  title,
  message,
  action,
  minHeight = 220,
  sx,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: 3,
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: tokens.surface,
        border: `1px dashed ${tokens.border}`,
        borderRadius: '20px',
        ...sx,
      }}
    >
      {icon && (
        <Box sx={{ fontSize: '2.5rem', mb: 1.5, lineHeight: 1 }}>
          {icon}
        </Box>
      )}

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: tokens.textPrimary,
          fontSize: '1.05rem',
        }}
      >
        {title}
      </Typography>

      {message && (
        <Typography
          variant="body2"
          sx={{
            color: tokens.textMuted,
            maxWidth: 380,
            mt: 0.5,
            lineHeight: 1.6,
          }}
        >
          {message}
        </Typography>
      )}

      {action && (
        <Box sx={{ mt: 2.5 }}>
          {action}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
