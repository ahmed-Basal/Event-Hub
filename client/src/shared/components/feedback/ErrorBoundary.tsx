import { Component, type ErrorInfo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { tokens } from '../../../theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Global / Component-level Error Boundary to catch render errors gracefully.
 * Adheres to SRP: catches uncaught rendering errors and renders fallback UI.
 */
export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 520,
              width: '100%',
              textAlign: 'center',
              backgroundColor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              borderRadius: 3,
              boxShadow: tokens.shadowCard,
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 70, 85, 0.12)',
                color: tokens.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary }}>
              Something went wrong
            </Typography>

            <Typography variant="body2" sx={{ color: tokens.textMuted, mb: 3 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </Typography>

            <Button
              variant="contained"
              onClick={this.handleReset}
              sx={{
                bgcolor: tokens.primary,
                color: tokens.bg,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#D97706',
                },
              }}
            >
              Try Again
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}
