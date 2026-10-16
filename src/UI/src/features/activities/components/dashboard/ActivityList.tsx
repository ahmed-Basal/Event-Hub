import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { EmptyState, useIntersectionObserver, formatDate } from '../../../../shared';
import ActivityCard from './ActivityCard';
import ActivityListSkeletons from './ActivityListSkeletons';
import ActivityListFooter from './ActivityListFooter';
import { useInfiniteActivitiesList } from '../../hooks';
import type { ActivityFilterValues } from './ActivityFilter';
import { tokens } from '../../../../theme';

export interface ActivityListProps {
  filters?: ActivityFilterValues;
  onClearDate?: () => void;
}

/**
 * Technical events list container.
 * Coordinates data fetching, state representation, and child composition.
 * Refactored to adhere strictly to SOLID principles (SRP, OCP, DIP).
 */
export default function ActivityList({ filters, onClearDate }: ActivityListProps) {
  const {
    activities,
    totalCount,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteActivitiesList({
    category: filters?.category,
    status: filters?.status,
    date: filters?.date,
    pageSize: 6,
  });

  // Reusable decoupled Intersection Observer hook (SRP)
  const sentinelRef = useIntersectionObserver({
    enabled: Boolean(hasNextPage && !isFetchingNextPage),
    onIntersect: fetchNextPage,
    rootMargin: '250px',
  });

  // Initial loading state
  if (isLoading) {
    return (
      <Grid container spacing={2.5}>
        <ActivityListSkeletons count={6} prefix="initial-skeleton" />
      </Grid>
    );
  }

  // Error boundary fallback
  if (isError) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: '20px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#EF4444', mb: 1, fontWeight: 600 }}>
          Failed to load activities
        </Typography>
        <Typography variant="body2" sx={{ color: tokens.textSecondary, mb: 2 }}>
          {error instanceof Error ? error.message : 'An unexpected error occurred while fetching meetups.'}
        </Typography>
        <Button variant="outlined" color="primary" onClick={() => refetch()}>
          Try Again
        </Button>
      </Box>
    );
  }

  // Empty state
  if (!activities || activities.length === 0) {
    if (filters?.date) {
      return (
        <EmptyState
          icon="📅"
          title="No events found on this date"
          message={`No meetups scheduled for ${formatDate(filters.date, 'EEEE, dd MMMM yyyy')}. Select another date or view all upcoming meetups.`}
          action={
            onClearDate && (
              <Button
                variant="contained"
                color="primary"
                onClick={onClearDate}
                sx={{
                  mt: 2,
                  borderRadius: '12px',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                }}
              >
                View All Events
              </Button>
            )
          }
        />
      );
    }

    return (
      <EmptyState
        icon="🎭"
        title="No events found"
        message="Check back later or try adjusting your filters!"
      />
    );
  }

  return (
    <Box component="section" aria-label="Activities Grid">
      {/* Active Date Filter Notice */}
      {filters?.date && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
            p: 1.5,
            px: 2,
            borderRadius: '14px',
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            border: `1px solid ${tokens.primary}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 20, color: tokens.primary }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.textPrimary }}>
              Showing events for: {formatDate(filters.date, 'EEEE, dd MMMM yyyy')}
            </Typography>
          </Box>
          {onClearDate && (
            <Button
              size="small"
              onClick={onClearDate}
              variant="text"
              sx={{ color: tokens.accent, fontWeight: 600, textTransform: 'none', fontSize: '0.8rem' }}
            >
              Show All Dates ✕
            </Button>
          )}
        </Box>
      )}

      <Grid container spacing={2.5}>
        {activities.map((activity) => (
          <Grid key={activity.id} size={{ xs: 12, sm: 6, xl: 4 }}>
            <ActivityCard activity={activity} />
          </Grid>
        ))}

        {/* Subsequent page loading skeletons */}
        {isFetchingNextPage && <ActivityListSkeletons count={3} prefix="page-skeleton" />}
      </Grid>

      {/* Pagination controls & infinite scroll sentinel */}
      <ActivityListFooter
        hasNextPage={Boolean(hasNextPage)}
        isFetchingNextPage={isFetchingNextPage}
        loadedCount={activities.length}
        totalCount={totalCount}
        onLoadMore={() => fetchNextPage()}
        sentinelRef={sentinelRef}
      />
    </Box>
  );
}
