import Grid from '@mui/material/Grid';
import ActivityCardSkeleton from './ActivityCardSkeleton';

export interface ActivityListSkeletonsProps {
  count?: number;
  prefix?: string;
}

/**
 * Renders a responsive grid of activity card skeletons.
 * Adheres to Single Responsibility Principle (SRP).
 */
export default function ActivityListSkeletons({ count = 6, prefix = 'skeleton' }: ActivityListSkeletonsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Grid key={`${prefix}-${index}`} size={{ xs: 12, sm: 6, xl: 4 }}>
          <ActivityCardSkeleton />
        </Grid>
      ))}
    </>
  );
}
