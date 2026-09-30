import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router';
import { tokens } from '../../../theme';
import type { Activity } from '../../../shared';
import { ActivityCard } from '../../activities';

export interface UpcomingEventsProps {
  activities?: Activity[];
  maxCount?: number;
}

export default function UpcomingEvents({ activities = [], maxCount = 3 }: UpcomingEventsProps) {
  const upcoming = activities.slice(0, maxCount);

  if (!upcoming.length) return null;

  return (
    <Box sx={{ py: { xs: 6, md: 9 }, bgcolor: tokens.bg }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: tokens.primary,
                fontWeight: 700,
                letterSpacing: '0.12em',
                fontSize: '0.75rem',
              }}
            >
              DON'T MISS OUT
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: '1.8rem', md: '2.4rem' },
                fontWeight: 800,
                color: tokens.textPrimary,
                letterSpacing: '-0.02em',
                mt: 0.5,
              }}
            >
              Upcoming Events
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/activities"
            endIcon={<ArrowForwardIcon />}
            sx={{
              color: tokens.teal,
              fontWeight: 600,
              fontSize: '0.9rem',
              px: 0,
              '&:hover': {
                color: tokens.primary,
                background: 'transparent',
              },
            }}
          >
            Explore All Events
          </Button>
        </Box>

        {/* Events Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: `repeat(${Math.min(upcoming.length, 3)}, 1fr)`,
            },
            gap: 3.5,
          }}
        >
          {upcoming.map((act) => (
            <ActivityCard key={act.id} activity={act} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
