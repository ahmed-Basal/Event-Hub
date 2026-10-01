import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { tokens } from '../../../theme';

export default function NotFound() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 2,
        py: 8,
      }}
    >
      <SearchOffIcon sx={{ fontSize: 80, color: tokens.textMuted }} />
      <Typography variant="h3" sx={{ fontWeight: 800, color: tokens.textPrimary }}>
        Oops - We couldn't find what you are looking for!
      </Typography>
      <Typography sx={{ color: tokens.textSecondary, maxWidth: 440 }}>
        The page or meetup you requested does not exist or may have been moved.
      </Typography>
      <Button
        component={Link}
        to="/activities"
        variant="contained"
        sx={{
          mt: 2,
          bgcolor: tokens.primary,
          color: tokens.bg,
          fontWeight: 700,
          px: 3.5,
          py: 1.1,
          borderRadius: '12px',
          boxShadow: tokens.shadowGold,
          '&:hover': { bgcolor: '#e08e0a' },
        }}
      >
        Return to Events Page
      </Button>
    </Container>
  );
}
