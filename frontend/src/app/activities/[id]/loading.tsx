'use client';

import { Box, Grid, Skeleton } from '@mui/material';

export default function ActivityDetailsLoading() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
          <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
        </Box>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: '16px', bgcolor: '#131A2D' }} />
      </Grid>
    </Grid>
  );
}
