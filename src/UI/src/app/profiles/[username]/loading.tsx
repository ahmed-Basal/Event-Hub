'use client';

import { Box, Skeleton } from '@mui/material';

export default function ProfileLoading() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: '18px', bgcolor: '#131A2D' }} />
      <Skeleton variant="rounded" height={420} sx={{ borderRadius: '18px', bgcolor: '#131A2D' }} />
    </Box>
  );
}
