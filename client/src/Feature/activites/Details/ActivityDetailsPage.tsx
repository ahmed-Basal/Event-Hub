import { useParams, Link } from 'react-router';
import Grid2 from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ActivityDetailsChats from './ActivityDetailscahts';
import ActivityDetailsInfo from './ActivityDetailsInfo';
import ActivityDetailsSideBar from './ActivityDetailsSideBar';
import ActivityDetailsheader from './ActivityDetailsHeaders';
import { useActivities, Spinner } from '../../../lib';
import { tokens } from '../../../theme/theme';

export default function ActivityDetails() {
  const { id } = useParams();
  const { activity, isLoadingActivity } = useActivities(id);

  if (isLoadingActivity) {
    return <Spinner message="Loading event details..." minHeight="60vh" />;
  }

  if (!activity) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '55vh',
          textAlign: 'center',
          gap: 2,
          py: 8,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: tokens.textPrimary }}>
          Meetup Not Found
        </Typography>
        <Typography sx={{ color: tokens.textSecondary, maxWidth: 440, lineHeight: 1.6 }}>
          The event you are looking for may have been deleted, moved, or the link is incorrect.
        </Typography>
        <Button
          component={Link}
          to="/activities"
          variant="contained"
          startIcon={<ArrowBackIcon />}
          sx={{
            mt: 2,
            bgcolor: tokens.primary,
            color: tokens.bg,
            fontWeight: 700,
            px: 3.5,
            py: 1.1,
            borderRadius: '12px',
            boxShadow: tokens.shadowGold,
            '&:hover': { bgcolor: '#e08e0a' },
          }}
        >
          Explore All Meetups
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* ── Top Navigation Breadcrumb ── */}
      <Button
        component={Link}
        to="/activities"
        startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
        sx={{
          color: tokens.textSecondary,
          mb: 2.5,
          px: 1.5,
          py: 0.6,
          borderRadius: '10px',
          fontSize: '0.85rem',
          '&:hover': {
            color: tokens.textPrimary,
            bgcolor: 'rgba(255, 255, 255, 0.04)',
          },
        }}
      >
        Back to Meetups
      </Button>

      {/* ── Two Column Details Layout ── */}
      <Grid2 container spacing={3.5}>
        <Grid2 size={{ xs: 12, md: 8 }}>
          <ActivityDetailsheader activity={activity} />
          <ActivityDetailsInfo activity={activity} />
          <ActivityDetailsChats />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <ActivityDetailsSideBar />
        </Grid2>
      </Grid2>
    </Box>
  );
}