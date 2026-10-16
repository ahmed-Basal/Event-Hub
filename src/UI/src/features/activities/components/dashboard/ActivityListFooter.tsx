import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { tokens } from '../../../../theme';

export interface ActivityListFooterProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadedCount: number;
  totalCount?: number;
  onLoadMore: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Renders the pagination footer, observer sentinel, and list completion indicator.
 * Adheres to Single Responsibility Principle (SRP).
 */
export default function ActivityListFooter({
  hasNextPage,
  isFetchingNextPage,
  loadedCount,
  totalCount,
  onLoadMore,
  sentinelRef,
}: ActivityListFooterProps) {
  return (
    <>
      {/* Invisible Intersection Observer Trigger Sentinel */}
      <Box ref={sentinelRef} sx={{ height: 20, mt: 2 }} />

      {/* Manual Load More fallback button */}
      {hasNextPage && !isFetchingNextPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            startIcon={<ExpandMoreIcon />}
            sx={{
              borderRadius: '14px',
              px: 4,
              py: 1.2,
              borderColor: tokens.border,
              color: tokens.textPrimary,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              '&:hover': {
                borderColor: tokens.primary,
                bgcolor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Load More Events {totalCount ? `(${loadedCount} of ${totalCount})` : ''}
          </Button>
        </Box>
      )}

      {/* End of list completion message */}
      {!hasNextPage && loadedCount > 0 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            py: 4,
            color: tokens.textSecondary,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 20, color: tokens.teal }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            You've viewed all {loadedCount} events
          </Typography>
        </Box>
      )}
    </>
  );
}
