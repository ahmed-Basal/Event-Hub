import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { tokens } from '../../../../theme';

export interface ActivityHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ActivityHeader({
  title = 'Explore Events',
  subtitle = 'Browse all developer meetups, workshops, and tech conferences in Egypt',
}: ActivityHeaderProps) {
  return (
    <Box sx={{ pt: 4, pb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <EmojiEventsIcon sx={{ fontSize: 28, color: tokens.primary }} />
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: tokens.textPrimary,
            fontSize: { xs: '1.5rem', md: '2rem' },
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: '0.85rem', color: tokens.textMuted, mt: 0.3 }}>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  );
}
