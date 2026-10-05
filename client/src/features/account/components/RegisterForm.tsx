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
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { tokens } from '../../../theme';
import TextInput from '../../../shared/components/form/TextInput';
import { registerSchema, type RegisterSchema } from '../schemas';
import { useAccount } from '../hooks/useAccount';

interface RegisterFormProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function RegisterForm({ onSuccess, isModal = false }: RegisterFormProps) {
  const { registerAsync, isRegistering } = useAccount();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      setServerError(null);
      await registerAsync(data);
      onSuccess?.();
    } catch (err: any) {
      const msg = Array.isArray(err)
        ? err.join(', ')
        : err?.response?.data?.message || err?.message || 'Registration failed';
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
        gap: 2.2,
        width: '100%',
        maxWidth: 460,
        mx: 'auto',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 0.5 }}>
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
          <PersonOutlinedIcon />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.textPrimary, letterSpacing: '-0.02em' }}>
          Create an Account
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
          Join the community of Egyptian software developers & engineers
        </Typography>
      </Box>

      {serverError && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {serverError}
        </Alert>
      )}

      <TextInput
        name="displayName"
        control={control}
        label="Full Display Name (e.g. Ahmed Basal)"
        autoComplete="name"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlinedIcon sx={{ color: tokens.textMuted, fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextInput
        name="username"
        control={control}
        label="Username (e.g. ahmed_basal)"
        autoComplete="username"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailIcon sx={{ color: tokens.textMuted, fontSize: 18 }} />
              </InputAdornment>
            ),
          },
        }}
      />

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
        label="Password (min 6 chars, 1 uppercase, 1 lowercase, 1 number)"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
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
        disabled={isRegistering || !isValid}
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
        {isRegistering ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: tokens.bg }} />
            <span>Creating account...</span>
          </Box>
        ) : (
          'Sign Up'
        )}
      </Button>

      {!isModal && (
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2" sx={{ color: tokens.textSecondary }}>
            Already have an account?{' '}
            <Typography
              component={NavLink}
              to="/login"
              sx={{
                color: tokens.primary,
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign in
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
