import { Grid } from '@mui/material';
import { useActivities, Spinner, EmptyState } from '../../../lib';
import ActivityCard from './ActivityCard';

export default function ActivityList() {
  const { activities, isPending } = useActivities();

  if (isPending) {
    return <Spinner message="Discovering tech events..." minHeight={350} />;
  }

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon="🎭"
        title="No events found"
        message="Check back later or host a new event!"
      />
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
