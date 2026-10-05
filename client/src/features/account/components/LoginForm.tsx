import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { NavLink } from 'react-router';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { tokens } from '../../../theme';
import TextInput from '../../../shared/components/form/TextInput';
import { loginSchema, type LoginSchema } from '../../../shared/schemas';
import { useAccount } from '../hooks/useAccount';

interface LoginFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function LoginForm({ onSuccess, isModal = false }: LoginFormProps) {
  const { loginAsync, isLoggingIn } = useAccount();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      setServerError(null);
      await loginAsync(data);
      onSuccess?.();
    } catch (err: any) {
      const msg = Array.isArray(err)
        ? err.join(', ')
        : err?.response?.data?.message || err?.message || 'Invalid email or password';
      setServerError(msg);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            bgcolor: 'rgba(238, 155, 0, 0.12)',
            color: tokens.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
            border: `1px solid rgba(238, 155, 0, 0.25)`,
          }}
        >
          <LockOutlinedIcon />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.textPrimary, letterSpacing: '-0.02em' }}>
          Welcome Back
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
          Sign in to your account to join Egypt developer meetups
        </Typography>
      </Box>

      {serverError && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {serverError}
        </Alert>
      )}

      <TextInput
        name="email"
        control={control}
        label="Email Address"
        type="email"
        autoComplete="email"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ color: tokens.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextInput
        name="password"
        control={control}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: tokens.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                  size="small"
                  sx={{ color: tokens.textMuted }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isLoggingIn || !isValid}
        sx={{
          bgcolor: tokens.primary,
          color: tokens.bg,
          py: 1.4,
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.95rem',
          boxShadow: tokens.shadowGold,
          mt: 1,
          '&:hover': {
            bgcolor: '#e08e0a',
          },
        }}
      >
        {isLoggingIn ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: tokens.bg }} />
            <span>Signing in...</span>
          </Box>
        ) : (
          'Sign In'
        )}
      </Button>

      {!isModal && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.textSecondary }}>
            Don&apos;t have an account?{' '}
            <Typography
              component={NavLink}
              to="/register"
              sx={{
                color: tokens.primary,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign up
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
