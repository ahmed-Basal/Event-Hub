import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Spinner from '../../../lib/components/Spinner';
import ActivityCard from './ActivityCard';
import useactivites from '../../../lib/Hooks/useactivites';
import { tokens } from '../../../theme/theme';

export default function ActivityList() {
  const { activities, isPending } = useactivites();

  if (isPending) {
    return <Spinner message="Discovering tech events..." minHeight={350} />;
  }

  if (!activities || activities.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 10,
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          borderRadius: '18px',
        }}
      >
        <Typography sx={{ fontSize: '2rem', mb: 1 }}>🎭</Typography>
        <Typography sx={{ color: tokens.textSecondary, fontWeight: 600 }}>
          No events found
        </Typography>
        <Typography sx={{ color: tokens.textMuted, fontSize: '0.85rem', mt: 0.5 }}>
          Check back later or host a new event!
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2.5}>
      {activities.map((activity) => (
        <Grid key={activity.id} size={{ xs: 12, sm: 6, xl: 4 }}>
          <ActivityCard activity={activity} />
        </Grid>
      ))}
    </Grid>
  );
}
