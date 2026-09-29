import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Backdrop from '@mui/material/Backdrop';
import { keyframes } from '@mui/material/styles';
import { tokens } from '../../../theme';

// Smooth Orbit Animations
const spinClockwise = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spinCounterClockwise = keyframes`
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
`;

const pulseGlow = keyframes`
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.6;
    box-shadow: 0 0 15px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.3);
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
    box-shadow: 0 0 30px rgba(245, 158, 11, 0.85), inset 0 0 15px rgba(245, 158, 11, 0.6);
  }
`;

const textShimmer = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; text-shadow: 0 0 12px rgba(245, 158, 11, 0.5); }
  100% { opacity: 0.6; }
`;

interface SpinnerProps {
  message?: string;
  size?: number;
  minHeight?: string | number;
  backdrop?: boolean;
}

export default function Spinner({
  message = 'Loading...',
  size = 72,
  minHeight = '55vh',
  backdrop = false,
}: SpinnerProps) {
  const content = (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: backdrop ? 'auto' : minHeight,
        gap: 3,
        py: 4,
        px: 2,
        userSelect: 'none',
      }}
    >
      {/* Tech Orbit / Glowing Radar Container */}
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Outer Orbital Ring */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: tokens.primary,
            borderRightColor: 'rgba(245, 158, 11, 0.3)',
            animation: `${spinClockwise} 1.4s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite`,
            filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))',
          }}
        />

        {/* Middle Counter-Rotating Ring */}
        <Box
          sx={{
            position: 'absolute',
            inset: 8,
            borderRadius: '50%',
            border: '2px dashed transparent',
            borderBottomColor: '#FF6B6B',
            borderLeftColor: 'rgba(255, 107, 107, 0.4)',
            animation: `${spinCounterClockwise} 2s linear infinite`,
            filter: 'drop-shadow(0 0 6px rgba(255, 107, 107, 0.4))',
          }}
        />

        {/* Inner Glowing Core */}
        <Box
          sx={{
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${tokens.primary} 30%, #D97706 100%)`,
            animation: `${pulseGlow} 1.8s ease-in-out infinite`,
          }}
        />
      </Box>

      {/* Pulsing Modern Tech Typography */}
      {message && (
        <Typography
          variant="body2"
          sx={{
            color: tokens.textSecondary,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            animation: `${textShimmer} 2s ease-in-out infinite`,
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (backdrop) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(10, 15, 29, 0.8)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
}
