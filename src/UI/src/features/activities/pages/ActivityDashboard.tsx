import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import {
  ActivityHeader,
  ActivityList,
  ActivityFilter,
  type ActivityFilterValues,
} from '../components/dashboard';
import { tokens } from '../../../theme';

export default function ActivityDashboard() {
  const [filters, setFilters] = useState<ActivityFilterValues>({
    category: 'all',
    status: 'all',
  });

  return (
    <Box sx={{ bgcolor: tokens.bg, minHeight: '100vh', pb: 6 }}>
      <Container maxWidth="xl">
        <ActivityHeader />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ActivityList filters={filters} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ActivityFilter value={filters} onChange={setFilters} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
