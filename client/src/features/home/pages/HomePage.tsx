import Box from '@mui/material/Box';
import NavBar from '../../../App/Layout/NavBar';
import { tokens } from '../../../theme';
import { useHomeData } from '../hooks';
import { HeroSection, StatsBar, UpcomingEvents } from '../components';

export default function HomePage() {
  const { featuredActivity, upcomingActivities, stats } = useHomeData();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: tokens.bg,
        color: tokens.textPrimary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Navigation ── */}
      <NavBar />

      {/* ── Hero Section (Brand, CTA, Featured Event Card) ── */}
      <HeroSection featuredActivity={featuredActivity} />

      {/* ── Stats Bar ── */}
      <StatsBar stats={stats} />

      {/* ── Upcoming Events Preview ── */}
      <UpcomingEvents activities={upcomingActivities} />
    </Box>
  );
}
