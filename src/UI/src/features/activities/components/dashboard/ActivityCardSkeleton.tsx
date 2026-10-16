import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { tokens } from '../../../../theme';

export default function ActivityCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: '20px',
        border: `1px solid ${tokens.border}`,
        bgcolor: tokens.surface,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: tokens.shadowCard,
      }}
    >
      {/* Cover Image Placeholder */}
      <Box sx={{ position: 'relative', width: '100%', pt: '50%' }}>
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(255, 255, 255, 0.05)',
          }}
        />
        {/* Category Chip Placeholder */}
        <Box sx={{ position: 'absolute', top: 14, left: 14 }}>
          <Skeleton
            variant="rounded"
            width={85}
            height={26}
            animation="wave"
            sx={{ borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.12)' }}
          />
        </Box>
        {/* Date Badge Placeholder */}
        <Box sx={{ position: 'absolute', top: 14, right: 14 }}>
          <Skeleton
            variant="rounded"
            width={48}
            height={48}
            animation="wave"
            sx={{ borderRadius: '14px', bgcolor: 'rgba(255, 255, 255, 0.12)' }}
          />
        </Box>
      </Box>

      {/* Content Body */}
      <Box sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Skeleton
          variant="text"
          width="80%"
          height={32}
          animation="wave"
          sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.08)' }}
        />
        <Skeleton
          variant="text"
          width="50%"
          height={20}
          animation="wave"
          sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}
        />

        {/* Location & Time Info */}
        <Stack spacing={1.2} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={18} height={18} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="text" width="60%" height={18} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={18} height={18} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="text" width="45%" height={18} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} />
          </Box>
        </Stack>

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
          <Skeleton variant="rounded" width={60} height={22} animation="wave" sx={{ borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.06)' }} />
          <Skeleton variant="rounded" width={75} height={22} animation="wave" sx={{ borderRadius: '8px', bgcolor: 'rgba(255, 255, 255, 0.06)' }} />
        </Box>

        {/* Footer: Attendees & Action Button */}
        <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${tokens.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Avatar stack */}
          <Box sx={{ display: 'flex', gap: -0.5 }}>
            <Skeleton variant="circular" width={28} height={28} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
            <Skeleton variant="circular" width={28} height={28} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', ml: -1 }} />
            <Skeleton variant="circular" width={28} height={28} animation="wave" sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', ml: -1 }} />
          </Box>
          {/* Button */}
          <Skeleton
            variant="rounded"
            width={100}
            height={36}
            animation="wave"
            sx={{ borderRadius: '12px', bgcolor: 'rgba(255, 255, 255, 0.1)' }}
          />
        </Box>
      </Box>
    </Card>
  );
}
