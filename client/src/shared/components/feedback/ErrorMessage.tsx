import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  type SxProps,
  type Theme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { tokens } from '../../../theme';
import type { AppError, ValidationErrorResponse } from '../../types';

export interface ErrorMessageProps {

  error?: string | string[] | Error | AppError | ValidationErrorResponse | null;

  title?: string;

  severity?: 'error' | 'warning' | 'info';

  onRetry?: () => void;

  onClose?: () => void;

  sx?: SxProps<Theme>;
}

function extractErrorMessages(
  error?: string | string[] | Error | AppError | ValidationErrorResponse | null
): string[] {
  if (!error) return [];

  if (typeof error === 'string') {
    return [error];
  }

  if (Array.isArray(error)) {
    return error.filter(Boolean).map(String);
  }

  if (error instanceof Error) {
    return [error.message];
  }

  if ('errors' in error && error.errors) {
    if (Array.isArray(error.errors)) {
      return error.errors.map(String);
    }
    if (typeof error.errors === 'object') {
      const messages: string[] = [];
      for (const key in error.errors) {
        const fieldErrors = error.errors[key];
        if (Array.isArray(fieldErrors)) {
          messages.push(...fieldErrors);
        } else if (fieldErrors) {
          messages.push(String(fieldErrors));
        }
      }
      return messages;
    }
  }

  if ('message' in error && error.message) {
    return [error.message];
  }

  return [String(error)];
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  title,
  severity = 'error',
  onRetry,
  onClose,
  sx,
}) => {
  const messages = extractErrorMessages(error);

  if (!messages.length && !title) {
    return null;
  }

  const defaultTitle =
    severity === 'error'
      ? messages.length > 1
        ? 'Validation Errors'
        : 'An error occurred'
      : severity === 'warning'
      ? 'Warning'
      : 'Notice';

  const displayTitle = title ?? defaultTitle;

  return (
    <Alert
      severity={severity}
      onClose={onClose}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={onRetry}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                px: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Retry
            </Button>
          )}
        </Box>
      }
      sx={{
        borderRadius: '14px',
        border: `1px solid ${
          severity === 'error'
            ? 'rgba(255,70,85,0.3)'
            : severity === 'warning'
            ? 'rgba(245,158,11,0.3)'
            : 'rgba(6,182,212,0.3)'
        }`,
        bgcolor:
          severity === 'error'
            ? 'rgba(255,70,85,0.08)'
            : severity === 'warning'
            ? 'rgba(245,158,11,0.08)'
            : 'rgba(6,182,212,0.08)',
        backdropFilter: 'blur(8px)',
        color: tokens.textPrimary,
        '& .MuiAlert-icon': {
          color:
            severity === 'error'
              ? tokens.accent
              : severity === 'warning'
              ? tokens.primary
              : tokens.teal,
        },
        ...sx,
      }}
    >
      <AlertTitle sx={{ fontWeight: 700, mb: messages.length > 1 ? 1 : 0.5 }}>
        {displayTitle}
      </AlertTitle>

      {messages.length === 1 ? (
        <Box sx={{ fontSize: '0.875rem', color: tokens.textSecondary, lineHeight: 1.5 }}>
          {messages[0]}
        </Box>
      ) : messages.length > 1 ? (
        <List dense disablePadding sx={{ mt: 0.5 }}>
          {messages.map((msg, idx) => (
            <ListItem
              key={idx}
              disableGutters
              sx={{
                py: 0.25,
                display: 'list-item',
                listStyleType: 'disc',
                listStylePosition: 'inside',
                color: tokens.textSecondary,
                fontSize: '0.875rem',
              }}
            >
              <ListItemText
                primary={msg}
                sx={{
                  m: 0,
                  display: 'inline',
                  '& .MuiTypography-root': {
                    fontSize: '0.875rem',
                    color: tokens.textSecondary,
                    display: 'inline',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      ) : null}
    </Alert>
  );
};

export default ErrorMessage;
