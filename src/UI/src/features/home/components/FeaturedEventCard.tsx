import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

  const formattedMonth = activity.date ? format(new Date(activity.date), 'MMM') : 'OCT';
  const formattedDay = activity.date ? format(new Date(activity.date), 'dd') : '25';
  const formattedFullDate = activity.date
    ? format(new Date(activity.date), 'EEEE, dd MMMM yyyy • h:mm a')
    : 'Date to be announced';

  const catKey = activity.category?.toLowerCase() || 'backend';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 460, lg: 470 },
        position: 'relative',
        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))',
        transition: 'transform 0.3s ease, filter 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          filter: 'drop-shadow(0 25px 50px rgba(245, 158, 11, 0.25))',
        },
      }}
    >
      {/* Holographic Border Wrap */}
      <Box
        sx={{
          p: '1.5px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.7) 0%, rgba(6, 182, 212, 0.4) 50%, rgba(168, 85, 247, 0.6) 100%)',
          position: 'relative',
        }}
      >
        {/* Ticket Outer Container */}
        <Box
          sx={{
            bgcolor: '#0e1320',
            borderRadius: '23px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Ticket Header Strip */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConfirmationNumberIcon sx={{ fontSize: 16, color: tokens.primary }} />
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: tokens.textSecondary,
                  textTransform: 'uppercase',
                }}
              >
                FLAGSHIP MEETUP PASS
              </Typography>
            </Box>

            <Chip
              label="VIP SPOTLIGHT"
              size="small"
              sx={{
                bgcolor: `${tokens.primary}22`,
                color: tokens.primary,
                border: `1px solid ${tokens.primary}50`,
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                height: 22,
              }}
            />
          </Box>

          {/* Visual Artwork Banner */}
          <Box
            sx={{
              height: 200,
              position: 'relative',
              backgroundImage: `url(${activity.image || `/images/categoryImages/${catKey}.jpg`})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(14, 19, 32, 0.2) 0%, rgba(14, 19, 32, 0.85) 80%, #0e1320 100%)',
              }}
            />

            {/* Date Tag Overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 14,
                left: 16,
                bgcolor: 'rgba(11, 15, 25, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${tokens.border}`,
                borderRadius: '12px',
                px: 1.6,
                py: 0.6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: tokens.primary,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight: 1,
                }}
              >
                {formattedMonth}
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  mt: 0.2,
                }}
              >
                {formattedDay}
              </Typography>
            </Box>

            {/* Category Pill */}
            <Box sx={{ position: 'absolute', top: 14, right: 16 }}>
              <Chip
                label={activity.category?.toUpperCase() || 'TECH EVENT'}
                sx={{
                  bgcolor: 'rgba(11, 15, 25, 0.85)',
                  backdropFilter: 'blur(8px)',
                  color: tokens.teal,
                  border: `1px solid ${tokens.teal}50`,
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  letterSpacing: '0.06em',
                }}
              />
            </Box>
          </Box>

          {/* Ticket Content Body */}
          <Box sx={{ p: 3, pt: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: '1.25rem',
                lineHeight: 1.35,
                color: tokens.textPrimary,
                letterSpacing: '-0.02em',
                mb: 1.8,
              }}
            >
              {activity.title}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: tokens.primary }} />
                <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
                  {formattedFullDate}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: tokens.teal }} />
                <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
                  {activity.venue}{activity.city ? `, ${activity.city}` : ''}
                </Typography>
              </Box>
            </Box>

            {/* Countdown Clock */}
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: tokens.textMuted,
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: tokens.accent,
                    boxShadow: `0 0 8px ${tokens.accent}`,
                  }}
                />
                Live Meetup Countdown
              </Typography>
              <CountdownDisplay countdown={countdown} />
            </Box>

            {/* Action CTA */}
            <Button
              component={Link}
              to={activity.slug ? `/activities/${activity.id}/${activity.slug}` : `/activities/${activity.id}`}
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{
                fontWeight: 800,
                fontSize: '0.92rem',
                py: 1.25,
                borderRadius: '12px',
                bgcolor: tokens.primary,
                color: tokens.bg,
                boxShadow: tokens.shadowGold,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#e08e0a',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              View Pass & Agenda
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
