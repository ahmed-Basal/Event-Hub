'use client';

import { Box, Grid, Skeleton } from '@mui/material';

export default function ActivitiesLoading() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="rounded" height={64} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={2.5}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="rounded" height={360} sx={{ borderRadius: '18px', bgcolor: '#131A2D' }} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Skeleton variant="rounded" height={240} sx={{ borderRadius: '16px', bgcolor: '#131A2D', mb: 2.5 }} />
          <Skeleton variant="rounded" height={300} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
        </Grid>
      </Grid>
    </Box>
  );
}
