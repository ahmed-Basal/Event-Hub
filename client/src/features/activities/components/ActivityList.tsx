import Grid from '@mui/material/Grid';
import { Spinner, EmptyState } from '../../../shared';
import ActivityCard from './ActivityCard';
import { useActivitiesList } from '../hooks/useActivitiesList';
import type { ActivityFilterValues } from './ActivityFilter';

export interface ActivityListProps {
  filters?: ActivityFilterValues;
}

export default function ActivityList({ filters }: ActivityListProps) {
  const { activities, isPending } = useActivitiesList(filters);

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
