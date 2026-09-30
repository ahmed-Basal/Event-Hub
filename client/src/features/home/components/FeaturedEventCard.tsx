import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { format } from 'date-fns';
import { Link } from 'react-router';
import { tokens } from '../../../theme';
import type { Activity } from '../../../shared';
import { useCountdown } from '../hooks';
import { CountdownDisplay } from './CountdownTimer';

export interface FeaturedEventCardProps {
  activity: Activity;
}

export default function FeaturedEventCard({ activity }: FeaturedEventCardProps) {
  const countdown = useCountdown(activity.date);

  const formattedMonth = activity.date ? format(new Date(activity.date), 'MMM') : '';
  const formattedDay = activity.date ? format(new Date(activity.date), 'dd') : '';
  const formattedFullDate = activity.date
    ? format(new Date(activity.date), 'dd MMM yyyy — h:mm a')
    : '';

  return (
    <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: 440 }, width: '100%' }}>
      <Box
        sx={{
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow: tokens.shadowCard,
          position: 'relative',
        }}
      >
        {/* Cover image area */}
        <Box
          sx={{
            height: 220,
            position: 'relative',
            bgcolor: tokens.surface2,
            backgroundImage: `url(/images/categoryImages/${activity.category?.toLowerCase() || 'backend'}.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Gradient overlay */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)',
            }}
          />

          {/* Date badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              bgcolor: 'rgba(11,15,25,0.91)',
              border: `1px solid ${tokens.border}`,
              borderRadius: '12px',
              px: 1.5,
              py: 0.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: 52,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.6rem',
                color: tokens.primary,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {formattedMonth}
            </Typography>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.1 }}>
              {formattedDay}
            </Typography>
          </Box>

          {/* Featured badge */}
          <Chip
            label="🔥 Featured"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              bgcolor: tokens.accent,
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              boxShadow: tokens.shadowCoral,
            }}
          />
        </Box>

        {/* Card body */}
        <Box sx={{ p: 2.5 }}>
          <Chip
            label={activity.category}
            size="small"
            sx={{
              bgcolor: `${tokens.teal}20`,
              color: tokens.teal,
              border: `1px solid ${tokens.teal}40`,
              fontSize: '0.68rem',
              fontWeight: 600,
              mb: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          />

          <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.35, mb: 1.5 }}>
            {activity.title}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
              <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>
                {formattedFullDate}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
              <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>
                {activity.venue}{activity.city ? `, ${activity.city}` : ''}
              </Typography>
            </Box>
          </Box>

          {/* Countdown timer */}
          <CountdownDisplay countdown={countdown} />

          {/* Details CTA button */}
          <Button
            component={Link}
            to={`/activities/${activity.slug || activity.id}`}
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ fontWeight: 700 }}
          >
            View Details
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
