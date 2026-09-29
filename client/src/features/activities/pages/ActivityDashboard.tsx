import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ActivityList from '../components/ActivityList';
import ActivityFilter, { type ActivityFilterValues } from '../components/ActivityFilter';
import { tokens } from '../../../theme';

/**
 * ActivityDashboard (Page)
 * Pattern: State Lifting
 * Keeps the filter state at the common parent level so both
 * ActivityFilter and ActivityList stay synchronized without prop drilling or global store overhead.
 */
export default function ActivityDashboard() {
  const [filters, setFilters] = useState<ActivityFilterValues>({
    category: 'all',
    status: 'all',
  });

  return (
    <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh', pb: 6 }}>
      <Container maxWidth="xl">
        {/* Page Header */}
        <Box sx={{ pt: 4, pb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <EmojiEventsIcon sx={{ fontSize: 28, color: tokens.primary }} />
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: tokens.textPrimary,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Explore Events
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color: tokens.textMuted, mt: 0.3 }}>
              Browse all developer meetups, workshops, and tech conferences in Egypt
            </Typography>
          </Box>
        </Box>

        {/* Main Grid */}
        <Grid container spacing={3}>
          {/* Activities List — Receives filter parameters */}
          <Grid size={{ xs: 12, md: 8 }}>
            <ActivityList filters={filters} />
          </Grid>

          {/* Sidebar Filters — Controls filter state */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ActivityFilter value={filters} onChange={setFilters} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
