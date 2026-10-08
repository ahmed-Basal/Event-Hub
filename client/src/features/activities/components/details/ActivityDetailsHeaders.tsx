import {
  Card,
  CardMedia,
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  CalendarMonth as CalendarMonthIcon,
  LocationOn as LocationOnIcon,
  EventBusy as EventBusyIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { Link } from 'react-router';
import { formatDate, type Activity } from '../../../shared';
import { tokens } from '../../../theme';
import { useActivityMutations } from '../hooks/useActivityMutations';

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
  const { updateActivity } = useActivityMutations(activity?.id);
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
          }}
        >
          EVENT CANCELLED
        </Box>
      )}

      <Box sx={{ position: 'relative', height: { xs: 260, md: 360 }, width: '100%' }}>
        <CardMedia
          component="img"
          image={activity?.image || `/images/categoryImages/${catKey}.jpg`}
          alt={activity?.title}
          sx={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            filter: isCancelled ? 'grayscale(80%)' : 'brightness(85%)',
            transition: 'filter 0.3s ease',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, rgba(11, 15, 25, 0.2) 0%, rgba(11, 15, 25, 0.7) 60%, ${tokens.surface} 100%)`,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            gap: 1.5,
            zIndex: 2,
          }}
        >
          <Chip
            label={activity?.category?.toUpperCase()}
            sx={{
              bgcolor: 'rgba(11, 15, 25, 0.75)',
              backdropFilter: 'blur(8px)',
              color: catTheme.color,
              fontWeight: 800,
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              border: `1px solid ${catTheme.color}50`,
              px: 0.5,
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: 24,
            left: { xs: 20, md: 36 },
            right: { xs: 20, md: 36 },
            zIndex: 3,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              fontSize: { xs: '1.65rem', sm: '2.2rem', md: '2.6rem' },
              lineHeight: 1.15,
              textShadow: '0 2px 16px rgba(0, 0, 0, 0.6)',
              mb: 1.5,
            }}
          >
            {activity?.title}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 2, md: 3 },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarMonthIcon sx={{ color: tokens.primary, fontSize: 20 }} />
              <Typography sx={{ color: tokens.textPrimary, fontWeight: 600, fontSize: '0.9rem' }}>
                {activity?.date ? formatDate(activity.date, 'EEEE, dd MMMM yyyy') : 'TBD'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon sx={{ color: tokens.teal, fontSize: 20 }} />
              <Typography sx={{ color: tokens.textSecondary, fontWeight: 500, fontSize: '0.9rem' }}>
                {activity?.venue ? `${activity.venue}, ${activity?.city}` : activity?.city}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          p: { xs: 2.5, md: '20px 36px' },
          bgcolor: tokens.surface,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: `${tokens.primary}25`,
              color: tokens.primary,
              fontWeight: 800,
              fontSize: '1.1rem',
              border: `1.5px solid ${tokens.primary}50`,
            }}
          >
            EG
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ color: tokens.textMuted, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Organized by
            </Typography>
            <Typography variant="subtitle1" sx={{ color: tokens.textPrimary, fontWeight: 700, lineHeight: 1.2 }}>
              Egypt Tech Community
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-start' },
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
                component={Link}
                to={`/manage/${activity?.id}`}
                variant="contained"
                disabled={isCancelled}
                startIcon={<EditIcon />}
                sx={{
                  borderRadius: '12px',
                  px: 2.5,
                  py: 1.1,
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  bgcolor: tokens.primary,
                  color: tokens.bg,
                  boxShadow: tokens.shadowGold,
                  '&:hover': {
                    bgcolor: '#e08e0a',
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
    </Card>
  );
}
