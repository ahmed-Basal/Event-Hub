import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Link } from 'react-router';
import { tokens } from '../../../theme';
import type { Activity } from '../../../shared';
import { ActivityCard } from '../../activities';

export interface UpcomingEventsProps {
  activities?: Activity[];
  selectedTrack?: string;
  onResetTrack?: () => void;
}

export default function UpcomingEvents({
  activities = [],
  selectedTrack = 'all',
  onResetTrack,
}: UpcomingEventsProps) {
  const isFiltered = selectedTrack !== 'all';

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: tokens.bg }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4.5,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography
                sx={{
                  color: tokens.primary,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                UPCOMING GATHERINGS
              </Typography>

              {isFiltered && (
                <Chip
                  label={`Track: ${selectedTrack.toUpperCase()}`}
                  size="small"
                  onDelete={onResetTrack}
                  sx={{
                    bgcolor: `${tokens.primary}22`,
                    color: tokens.primary,
                    border: `1px solid ${tokens.primary}50`,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 24,
                  }}
                />
              )}
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                fontWeight: 800,
                color: tokens.textPrimary,
                letterSpacing: '-0.025em',
              }}
            >
              Scheduled Meetups & Workshops
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.textSecondary, mt: 0.5 }}>
              Hand-picked sessions hosted across Egypt's leading innovation hubs and university campuses.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/activities"
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: tokens.teal,
              fontWeight: 700,
              fontSize: '0.92rem',
              px: 0,
              '&:hover': {
                color: tokens.primary,
                background: 'transparent',
              },
            }}
          >
            Explore All Meetups ({activities.length})
          </Button>
        </Box>

        {/* Empty State for Filtered Track */}
        {activities.length === 0 ? (
          <Box
            sx={{
              p: 6,
              borderRadius: '20px',
              bgcolor: tokens.surface,
              border: `1px dashed ${tokens.border}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              my: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.textPrimary }}>
              No meetups scheduled for this track yet
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.textSecondary, maxWidth: 500 }}>
              Be the first engineer to organize a meetup in this category, or reset the track filter to browse all available sessions.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              {onResetTrack && (
                <Button
                  variant="outlined"
                  onClick={onResetTrack}
                  startIcon={<RestartAltIcon />}
                  sx={{ borderColor: tokens.border, color: tokens.textPrimary }}
                >
                  View All Tracks
                </Button>
              )}
              <Button
                component={Link}
                to="/createActivity"
                variant="contained"
                sx={{ bgcolor: tokens.primary, color: tokens.bg }}
              >
                Host Meetup in This Track
              </Button>
            </Box>
          </Box>
        ) : (
          /* Events Grid */
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: `repeat(${Math.min(activities.length, 3)}, 1fr)`,
              },
              gap: 3.5,
            }}
          >
            {activities.map((act) => (
              <ActivityCard key={act.id} activity={act} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
