import React from 'react';
import { Box, Paper, Typography, type SxProps, type Theme } from '@mui/material';
import { tokens } from '../../../theme';

export interface LogisticsCardProps {

  icon: React.ReactNode;

  color?: string;

  label: string;

  value: React.ReactNode;

  subtitle?: React.ReactNode;

  onClick?: () => void;

  sx?: SxProps<Theme>;
}

export const LogisticsCard: React.FC<LogisticsCardProps> = ({
  icon,
  color = tokens.primary,
  label,
  value,
  subtitle,
  onClick,
  sx,
}) => {
  const isClickable = Boolean(onClick);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      sx={{
        p: 2.5,
        borderRadius: '18px',
        bgcolor: tokens.surface,
        border: `1px solid ${tokens.border}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          borderColor: tokens.borderHover,
          bgcolor: tokens.surface2,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.35)`,
          '& .logistics-badge': {
            transform: 'scale(1.08)',
            boxShadow: `0 0 16px ${color}40`,
          },
        },
        ...sx,
      }}
    >

      <Box
        className="logistics-badge"
        sx={{
          width: 44,
          height: 44,
          borderRadius: '12px',
          bgcolor: `${color}18`,
          border: `1px solid ${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
          transition: 'all 0.2s ease',
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: tokens.textMuted,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
          }}
        >
          {label}
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            color: tokens.textPrimary,
            mt: 0.3,
            lineHeight: 1.4,
          }}
        >
          {value}
        </Typography>

        {subtitle && (
          <Box sx={{ mt: 0.5 }}>
            {typeof subtitle === 'string' ? (
              <Typography variant="caption" sx={{ color: tokens.textSecondary, display: 'block' }}>
                {subtitle}
              </Typography>
            ) : (
              subtitle
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LogisticsCard;
