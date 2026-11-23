'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  Clear as ClearIcon,
  GridView as GridViewIcon,
  Map as MapIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { activitiesApi } from '@features/Activities/Frontend';
import { useAccount } from '@features/Account/Frontend';
import { useBookmarks } from '@features/Activities/Frontend';
import { useAppStore } from '@/core/store/useAppStore';
import type { Activity } from '@features/Activities/Frontend';
import type { ApiResponse } from '@/core/api/types';
import { tokens } from '@/theme/tokens';
import ActivityCard from './ActivityCard';
import ActivityFilters from './ActivityFilters';

const ActivitiesMapView = dynamic(() => import('./ActivitiesMapView'), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rounded" height={560} sx={{ borderRadius: '18px', bgcolor: tokens.surface }} />
  ),
});

interface Props {
  initialData?: ApiResponse<Activity[]> | null;
}

export default function ActivityDashboardClient({ initialData }: Props) {
  const { currentUser, isLoggedIn } = useAccount();
  const { bookmarks, isBookmarked } = useBookmarks();

  const filters = useAppStore((s) => s.filters);
  const setFilter = useAppStore((s) => s.setFilter);
  const resetFilters = useAppStore((s) => s.resetFilters);

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim() !== filters.search) {
        setFilter('search', searchInput.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, setFilter]);

  const isDefaultQuery =
    filters.pageNumber === 1 &&
    filters.pageSize === 6 &&
    filters.filter === 'all' &&
    filters.category === 'all' &&
    filters.city === 'all' &&
    filters.pricing === 'all' &&
    filters.sortBy === 'date' &&
    !filters.startDate &&
    !filters.search &&
    filters.viewMode === 'cards' &&
    !filters.savedOnly;

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () =>
      activitiesApi.list({
        pageNumber: filters.viewMode === 'map' || filters.savedOnly ? 1 : filters.pageNumber,
        pageSize: filters.viewMode === 'map' || filters.savedOnly ? 50 : filters.pageSize,
        filter: filters.filter === 'all' ? undefined : filters.filter,
        category: filters.category === 'all' ? undefined : filters.category,
        city: filters.city === 'all' ? undefined : filters.city,
        pricing: filters.pricing === 'all' ? undefined : filters.pricing,
        sortBy: filters.sortBy,
        startDate: filters.startDate ?? undefined,
        search: filters.search || undefined,
      }),
    initialData: isDefaultQuery && initialData ? initialData : undefined,
    placeholderData: (prev) => prev,
  });

  const rawActivities = data?.data ?? [];
  const activities = filters.savedOnly
    ? rawActivities.filter((a) => isBookmarked(a.id))
    : rawActivities;

  const meta = data?.meta;
  const totalCount = filters.savedOnly ? activities.length : (meta?.totalCount ?? activities.length);
  const totalPages = filters.savedOnly ? 1 : (meta?.totalPages ?? 1);

  const hasActiveFilters =
    filters.filter !== 'all' ||
    filters.category !== 'all' ||
    filters.city !== 'all' ||
    filters.pricing !== 'all' ||
    filters.savedOnly ||
    Boolean(filters.startDate) ||
    Boolean(filters.search);

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Search, Sort & View Mode Bar */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search meetups by title, city, venue, or track..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          sx={{ flex: 1, minWidth: { xs: '100%', md: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: tokens.primaryLight }} />
                </InputAdornment>
              ),
              endAdornment: searchInput ? (
                <InputAdornment position="end">
                  <ClearIcon
                    fontSize="small"
                    sx={{ cursor: 'pointer', color: tokens.textMuted }}
                    onClick={() => setSearchInput('')}
                  />
                </InputAdornment>
              ) : null,
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Select
            size="small"
            value={filters.sortBy}
            onChange={(e) => setFilter('sortBy', e.target.value as typeof filters.sortBy)}
            startAdornment={<SortIcon sx={{ fontSize: 18, mr: 0.75, color: tokens.primaryLight }} />}
            sx={{ borderRadius: '10px', bgcolor: tokens.surface2, minWidth: 165 }}
          >
            <MenuItem value="hot">🔥 Hot Trending</MenuItem>
            <MenuItem value="date">Upcoming First</MenuItem>
            <MenuItem value="popular">Most Popular</MenuItem>
            <MenuItem value="priceAsc">Price: Low to High</MenuItem>
            <MenuItem value="priceDesc">Price: High to Low</MenuItem>
          </Select>

          <Select
            size="small"
            value={filters.pageSize}
            onChange={(e) => setFilter('pageSize', Number(e.target.value))}
            sx={{ borderRadius: '10px', bgcolor: tokens.surface2, minWidth: 105 }}
          >
            <MenuItem value={6}>6 / page</MenuItem>
            <MenuItem value={9}>9 / page</MenuItem>
            <MenuItem value={12}>12 / page</MenuItem>
          </Select>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={filters.viewMode}
            onChange={(_, val) => val && setFilter('viewMode', val)}
            sx={{ bgcolor: tokens.surface2, borderRadius: '10px' }}
          >
            <ToggleButton value="cards" sx={{ px: 1.5 }}>
              <GridViewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Cards
            </ToggleButton>
            <ToggleButton value="map" sx={{ px: 1.5 }}>
              <MapIcon fontSize="small" sx={{ mr: 0.5 }} />
              Map
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Quick Chips Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {(['all', 'free', 'paid'] as const).map((p) => (
            <Chip
              key={p}
              clickable
              label={p === 'all' ? 'All Prices' : p === 'free' ? 'Free Events' : 'Paid Tickets'}
              onClick={() => setFilter('pricing', p)}
              sx={{
                bgcolor: filters.pricing === p ? tokens.primary : tokens.surface,
                color: filters.pricing === p ? '#fff' : tokens.textSecondary,
                border: `1px solid ${filters.pricing === p ? tokens.primary : tokens.border}`,
                fontWeight: 700,
              }}
            />
          ))}

          <Chip
            clickable
            icon={<BookmarkIcon sx={{ fontSize: 16 }} />}
            label={`Saved (${bookmarks.length})`}
            onClick={() => setFilter('savedOnly', !filters.savedOnly)}
            sx={{
              bgcolor: filters.savedOnly ? tokens.teal : tokens.surface,
              color: filters.savedOnly ? '#0A0E1A' : tokens.textSecondary,
              border: `1px solid ${filters.savedOnly ? tokens.teal : tokens.border}`,
              fontWeight: 700,
            }}
          />

          {filters.city !== 'all' && (
            <Chip
              label={`City: ${filters.city}`}
              onDelete={() => setFilter('city', 'all')}
              sx={{ bgcolor: `${tokens.teal}22`, color: tokens.teal }}
            />
          )}

          {hasActiveFilters && (
            <Button
              size="small"
              color="secondary"
              onClick={handleReset}
              startIcon={<ClearIcon fontSize="small" />}
            >
              Reset
            </Button>
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {totalCount} {totalCount === 1 ? 'meetup' : 'meetups'} found
        </Typography>
      </Box>

      {/* Main 2-Column Layout */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ opacity: isPlaceholderData ? 0.65 : 1, transition: 'opacity 0.2s' }}>
            {isLoading ? (
              <Grid container spacing={2.5}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6 }}>
                    <Skeleton
                      variant="rounded"
                      height={360}
                      sx={{ borderRadius: '18px', bgcolor: tokens.surface }}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : activities.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '18px' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No activities match your filters
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2.5}>
                  Try clearing your search, city, pricing, or date filter to see more meetups.
                </Typography>
                {hasActiveFilters && (
                  <Button variant="contained" onClick={handleReset}>
                    Clear All Filters
                  </Button>
                )}
              </Paper>
            ) : filters.viewMode === 'map' ? (
              <ActivitiesMapView activities={activities} />
            ) : (
              <Grid container spacing={2.5}>
                {activities.map((activity) => (
                  <Grid key={activity.id} size={{ xs: 12, sm: 6 }}>
                    <ActivityCard
                      activity={activity}
                      currentUsername={currentUser?.username}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {filters.viewMode === 'cards' && totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 4,
                  p: 2,
                  borderRadius: '14px',
                  bgcolor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Page {filters.pageNumber} of {totalPages} • {totalCount} total events
                </Typography>
                <Pagination
                  count={totalPages}
                  page={filters.pageNumber}
                  onChange={(_, value) => {
                    setFilter('pageNumber', value);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <ActivityFilters
            filter={filters.filter}
            category={filters.category}
            city={filters.city}
            startDate={filters.startDate ? new Date(filters.startDate) : null}
            isLoggedIn={isLoggedIn}
            onFilterChange={(v) => setFilter('filter', v)}
            onCategoryChange={(v) => setFilter('category', v)}
            onCityChange={(v) => setFilter('city', v)}
            onStartDateChange={(d) => setFilter('startDate', d ? d.toISOString() : null)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
