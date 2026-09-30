import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { tokens } from '../../../theme';
import type { CountdownTime } from '../hooks';

export interface CountdownBoxProps {
  value: number;
  label: string;
}

export function CountdownBox({ value, label }: CountdownBoxProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 }}>
      <Box
        sx={{
          bgcolor: 'rgba(11,15,25,0.85)',
          border: `1px solid ${tokens.border}`,
          borderRadius: '12px',
          px: 1.5,
          py: 0.5,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: tokens.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 52,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {String(value).padStart(2, '0')}
      </Box>
      <Typography
        sx={{
          fontSize: '0.62rem',
          color: tokens.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mt: 0.4,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export interface CountdownDisplayProps {
  countdown: CountdownTime;
}

export function CountdownDisplay({ countdown }: CountdownDisplayProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 2.5,
        pb: 2,
        borderBottom: `1px solid ${tokens.border}`,
      }}
    >
      <CountdownBox value={countdown.days} label="Days" />
      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
      <CountdownBox value={countdown.hours} label="Hours" />
      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
      <CountdownBox value={countdown.mins} label="Mins" />
      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
      <CountdownBox value={countdown.secs} label="Secs" />
    </Box>
  );
}
