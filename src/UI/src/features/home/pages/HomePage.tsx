import Box from '@mui/material/Box';
import { tokens } from '../../../theme';
import { useHomeData } from '../hooks';
import { HeroSection, UpcomingEvents } from '../components';

export default function HomePage() {
  const { featuredActivity, upcomingActivities } = useHomeData();

  return (
    <Box
      sx={{
        bgcolor: tokens.bg,
        color: tokens.textPrimary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <HeroSection featuredActivity={featuredActivity} />
      <UpcomingEvents activities={upcomingActivities} />
    </Box>
  );
}
