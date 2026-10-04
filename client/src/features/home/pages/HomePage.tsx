import Box from '@mui/material/Box';
import NavBar from '../../../App/Layout/NavBar';
import { tokens } from '../../../theme';
import { useHomeData } from '../hooks';
import { HeroSection, UpcomingEvents } from '../components';

export default function HomePage() {
  const { featuredActivity, upcomingActivities } = useHomeData();

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

      <NavBar />

      <HeroSection featuredActivity={featuredActivity} />



      <UpcomingEvents activities={upcomingActivities} />
    </Box>
  );
}
