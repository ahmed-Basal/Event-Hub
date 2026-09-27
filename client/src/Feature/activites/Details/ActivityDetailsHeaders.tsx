import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link } from 'react-router';
import type { Activity } from '../../../lib/Types';
import useactivites from '../../../lib/Hooks/useactivites';
import { formatDate } from '../../../lib/UTlity/Utle';
import { tokens } from '../../../theme/theme';

interface Props {
  activity: Activity;
}

const CATEGORY_GRADIENTS: Record<string, { badge: string; color: string }> = {
  backend: { badge: `${tokens.teal}26`, color: tokens.teal },
  frontend: { badge: 'rgba(167, 139, 250, 0.25)', color: '#c4b5fd' },
  cybersecurity: { badge: 'rgba(74, 222, 128, 0.22)', color: '#86efac' },
  dataanalysis: { badge: `${tokens.accent}26`, color: '#fca5a5' },
  devops: { badge: `${tokens.primary}26`, color: tokens.primary },
};

export default function ActivityDetailsHeader({ activity }: Props) {
  const { updateActivity } = useactivites(activity?.id);
  const isCancelled = activity?.isCancelled ?? false;
  const isHost = true;
  const isGoing = true;
  const loading = false;

  const catKey = activity?.category?.toLowerCase() || 'backend';
  const catTheme = CATEGORY_GRADIENTS[catKey] ?? { badge: 'rgba(255,255,255,0.15)', color: '#ffffff' };

  return (
    <Card
      sx={{
        position: 'relative',
        mb: 3,
        borderRadius: '24px',
        overflow: 'hidden',
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.shadowCard,
        bgcolor: tokens.surface,
      }}
    >
      {/* ── Cancelled Ribbon/Badge ── */}
      {isCancelled && (
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 10,
            bgcolor: tokens.accent,
            color: '#FFFFFF',
            px: 2,
            py: 0.6,
            borderRadius: '9999px',
            fontWeight: 800,
            fontSize: '0.8rem',
            letterSpacing: '0.05em',
            boxShadow: tokens.shadowCoral,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
          }}
        >
          <EventBusyIcon sx={{ fontSize: 16 }} />
          EVENT CANCELLED
        </Box>
      )}

      {/* ── Hero Image with Rich Overlay ── */}
      <Box sx={{ position: 'relative', height: { xs: 240, sm: 340, md: 400 } }}>
        <CardMedia
          component="img"
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            filter: isCancelled ? 'grayscale(80%) brightness(0.6)' : 'brightness(0.85)',
          }}
          image={`/images/categoryImages/${catKey}.jpg`}
          alt={activity?.category || 'tech event'}
        />

        {/* Cinematic Multi-stop Dark Gradient */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, #0B0F19 0%, rgba(11, 15, 25, 0.85) 45%, rgba(11, 15, 25, 0.2) 100%)',
          }}
        />

        {/* ── Content on top of banner ── */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: { xs: 2.5, sm: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 2.5,
          }}
        >
          {/* Main Info */}
          <Box sx={{ maxWidth: { xs: '100%', md: '70%' } }}>
            {/* Badges */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={activity?.category}
                size="small"
                sx={{
                  bgcolor: catTheme.badge,
                  color: catTheme.color,
                  border: `1px solid ${catTheme.color}50`,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  backdropFilter: 'blur(8px)',
                }}
              />
              {activity?.level && (
                <Chip
                  label={activity.level}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    color: tokens.textPrimary,
                    border: `1px solid ${tokens.border}`,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              )}
            </Box>

            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.5rem', sm: '2.1rem', md: '2.4rem' },
                color: tokens.textPrimary,
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
                mb: 1.5,
              }}
            >
              {activity?.title}
            </Typography>

            {/* Meta row: Date + Location + Host */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: { xs: 1.5, sm: 2.5 },
                color: tokens.textSecondary,
                fontSize: '0.88rem',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <CalendarMonthIcon sx={{ fontSize: 18, color: tokens.primary }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.textPrimary }}>
                  {formatDate(activity?.date)}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LocationOnIcon sx={{ fontSize: 18, color: tokens.accent }} />
                <Typography variant="body2" sx={{ color: tokens.textSecondary }}>
                  {activity?.city ? `${activity.venue}, ${activity.city}` : activity?.venue}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src="/images/user.png"
                  sx={{
                    width: 24,
                    height: 24,
                    border: `1.5px solid ${tokens.primary}`,
                  }}
                />
                <Typography variant="body2" sx={{ color: tokens.textSecondary }}>
                  Hosted by{' '}
                  <Typography
                    component={Link}
                    to="/profiles/bob"
                    sx={{
                      color: tokens.primary,
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Bob
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              width: { xs: '100%', md: 'auto' },
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
            }}
          >
            {isHost ? (
              <>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (activity) {
                      updateActivity.mutate({
                        ...activity,
                        isCancelled: !isCancelled,
                      });
                    }
                  }}
                  disabled={updateActivity.isPending}
                  startIcon={isCancelled ? <CheckCircleIcon /> : <EventBusyIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1.1,
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    borderColor: isCancelled ? `${tokens.teal}60` : `${tokens.accent}60`,
                    color: isCancelled ? tokens.teal : tokens.accent,
                    bgcolor: isCancelled ? `${tokens.teal}12` : `${tokens.accent}12`,
                    '&:hover': {
                      borderColor: isCancelled ? tokens.teal : tokens.accent,
                      bgcolor: isCancelled ? `${tokens.teal}24` : `${tokens.accent}24`,
                    },
                  }}
                >
                  {isCancelled ? 'Re-activate Event' : 'Cancel Event'}
                </Button>

                <Button
                  variant="contained"
                  component={Link}
                  to={`/manage/${activity?.id}`}
                  disabled={isCancelled}
                  startIcon={<EditIcon />}
                  sx={{
                    borderRadius: '12px',
                    px: 3,
                    py: 1.1,
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    bgcolor: tokens.primary,
                    color: tokens.bg,
                    boxShadow: tokens.shadowGold,
                    '&:hover': {
                      bgcolor: '#e08e0a',
                      boxShadow: '0 12px 30px rgba(245, 158, 11, 0.35)',
                    },
                  }}
                >
                  Manage Event
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                disabled={isCancelled || loading}
                sx={{
                  borderRadius: '12px',
                  px: 3.5,
                  py: 1.1,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  bgcolor: isGoing ? 'rgba(255, 255, 255, 0.08)' : tokens.primary,
                  color: isGoing ? tokens.textPrimary : tokens.bg,
                  border: isGoing ? `1px solid ${tokens.border}` : 'none',
                  boxShadow: isGoing ? 'none' : tokens.shadowGold,
                  '&:hover': {
                    bgcolor: isGoing ? 'rgba(255, 255, 255, 0.12)' : '#e08e0a',
                  },
                }}
              >
                {isGoing ? 'Cancel Attendance' : 'Join Meetup'}
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
