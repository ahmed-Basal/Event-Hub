'use client';

import Link from 'next/link';
import { Box, Button, Chip, Container, Grid, Typography } from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  EventAvailable as EventAvailableIcon,
  Groups as GroupsIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import type { Activity } from '@features/Activities/Frontend';
import { tokens } from '@/theme/tokens';
import { useAccount } from '@features/Account/Frontend';
import FeaturedEventCard from './FeaturedEventCard';
import { ActivityCard } from '@features/Activities/Frontend';

interface HomeClientProps {
  activities: Activity[];
}

export default function HomeClient({ activities }: HomeClientProps) {
  const { currentUser } = useAccount();
  const featuredActivity = activities[0];
  const upcomingActivities = activities.slice(0, 6);

  return (
    <Box sx={{ bgcolor: tokens.bg, color: tokens.textPrimary, display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section — Your Original DevMeet Egypt Design in Electric Blue + Teal */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: { xs: 580, lg: 680 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          py: { xs: 6, md: 8, lg: 9 },
        }}
      >
        {/* Dynamic Background Mesh & Electric Blue + Teal Spotlights */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(circle 900px at 15% 20%, rgba(14, 165, 233, 0.16) 0%, transparent 60%),
              radial-gradient(circle 700px at 85% 70%, rgba(20, 184, 166, 0.14) 0%, transparent 55%)
            `,
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: { xs: 6, lg: 8 },
            }}
          >
            {/* Left Column */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 58%' }, maxWidth: { lg: 680 } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 3 }}>
                <Chip
                  icon={
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: tokens.teal,
                        boxShadow: `0 0 10px ${tokens.teal}`,
                        ml: '10px !important',
                        mr: '-4px !important',
                      }}
                    />
                  }
                  label="DEVMEET EGYPT • لمة مبرمجين"
                  sx={{
                    bgcolor: `${tokens.primary}1a`,
                    border: `1px solid ${tokens.primary}44`,
                    color: tokens.primaryLight,
                    fontWeight: 700,
                    fontSize: { xs: '0.75rem', sm: '0.82rem' },
                    letterSpacing: '0.06em',
                    borderRadius: '9999px',
                    py: 0.6,
                    px: 0.8,
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.6rem', sm: '3.7rem', md: '4.3rem', lg: '4.7rem' },
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-0.035em',
                  color: '#ffffff',
                  mb: 2.5,
                }}
              >
                Where Egypt&apos;s Top Engineers{' '}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(135deg, ${tokens.primaryLight}, ${tokens.teal})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Gather &amp; Build.
                </Box>
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: tokens.textSecondary,
                  fontWeight: 400,
                  lineHeight: 1.65,
                  mb: 4,
                  maxWidth: 580,
                }}
              >
                Discover high-signal tech meetups, workshops, and developer conferences across Cairo, Alexandria, and beyond — with live SignalR discussions and instant SSE notifications.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
                <Button
                  component={Link}
                  href="/activities"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 3.5, py: 1.4, borderRadius: '9999px', fontSize: '0.95rem' }}
                >
                  Explore Meetups
                </Button>
                <Button
                  component={Link}
                  href="/createActivity"
                  variant="outlined"
                  size="large"
                  startIcon={<AddIcon />}
                  sx={{ px: 3.2, py: 1.4, borderRadius: '9999px', fontSize: '0.95rem' }}
                >
                  Host an Event
                </Button>
              </Box>

              {/* Stats Strip */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 3, sm: 5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <GroupsIcon sx={{ color: tokens.primaryLight }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>2,500+</Typography>
                    <Typography variant="caption" color="text.secondary">Engineers</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <EventAvailableIcon sx={{ color: tokens.teal }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>{activities.length || 12}+</Typography>
                    <Typography variant="caption" color="text.secondary">Active Meetups</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <TerminalIcon sx={{ color: tokens.primary }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Live</Typography>
                    <Typography variant="caption" color="text.secondary">SignalR &amp; SSE</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right Column: Featured Event Spotlight Ticket */}
            {featuredActivity && (
              <Box sx={{ flex: { xs: '1 1 100%', lg: '0 0 auto' }, width: { xs: '100%', lg: 'auto' }, display: 'flex', justifyContent: 'center' }}>
                <FeaturedEventCard activity={featuredActivity} />
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Upcoming Events Section */}
      {upcomingActivities.length > 0 && (
        <Box sx={{ py: { xs: 6, md: 8 }, borderTop: `1px solid ${tokens.border}` }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="overline" sx={{ color: tokens.accent, fontWeight: 800, letterSpacing: '0.12em' }}>
                  🔥 TRENDING BY HOT ALGORITHM
                </Typography>
                <Typography variant="h4" fontWeight={800}>
                  Hottest Meetups on DevMeet Egypt
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/activities"
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: '9999px' }}
              >
                View All Events
              </Button>
            </Box>

            <Grid container spacing={3}>
              {upcomingActivities.map((act) => (
                <Grid key={act.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ActivityCard activity={act} currentUsername={currentUser?.username} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}
    </Box>
  );
}
