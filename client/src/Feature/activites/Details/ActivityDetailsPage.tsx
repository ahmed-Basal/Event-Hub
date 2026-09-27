import useactivites from '../../../lib/Hooks/useactivites';
import { useParams, Link } from 'react-router';
import Grid2 from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ActivityDetailsChats from './ActivityDetailscahts';
import ActivityDetailsInfo from './ActivityDetailsInfo';
import ActivityDetailsSideBar from './ActivityDetailsSideBar';
import ActivityDetailsheader from './ActivityDetailsHeaders';
import Spinner from '../../../lib/components/Spinner';
import { tokens } from '../../../theme/theme';

export default function ActivityDetails() {
  const { id } = useParams();
  const { activity, isLoadingActivity } = useactivites(id);

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
          minHeight: '50vh',
          textAlign: 'center',
          gap: 2,
          py: 8,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
          Event Not Found
        </Typography>
        <Typography sx={{ color: tokens.textSecondary, maxWidth: 420 }}>
          The event you are looking for could not be found or may have been removed.
        </Typography>
        <Button
          component={Link}
          to="/activities"
          variant="contained"
          sx={{
            mt: 2,
            bgcolor: tokens.primary,
            color: tokens.bg,
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': { bgcolor: '#D97706' },
          }}
        >
          Explore All Events
        </Button>
      </Box>
    );
  }
  return (
    <Grid2 container spacing={3}>
      <Grid2 size={{ xs: 12, md: 8 }}>
        <ActivityDetailsheader activity={activity} />
        <ActivityDetailsInfo activity={activity} />
        <ActivityDetailsChats />
      </Grid2>

      <Grid2 size={{ xs: 12, md: 4 }}>
        <ActivityDetailsSideBar />
      </Grid2>
    </Grid2>
  );
}