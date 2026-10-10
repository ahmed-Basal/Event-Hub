import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AddIcon from '@mui/icons-material/Add';
import GroupsIcon from '@mui/icons-material/Groups';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TerminalIcon from '@mui/icons-material/Terminal';
import { Link } from 'react-router';
import { tokens } from '../../../theme';
import type { Activity } from '../../../shared';
import type { HomeStats } from '../types';
import FeaturedEventCard from './FeaturedEventCard';

export interface HeroSectionProps {
  featuredActivity?: Activity;
  stats?: HomeStats;
}

export default function HeroSection({ featuredActivity, stats }: HeroSectionProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 600, lg: 720 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        py: { xs: 6, md: 8, lg: 10 },
      }}
    >
      {/* Dynamic Background Mesh & Radial Spotlight */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle 900px at 15% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 60%),
            radial-gradient(circle 700px at 85% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 55%),
            radial-gradient(circle 600px at 50% 100%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)
          `,
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
          {/* Left Column (60%) */}
          <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 58%' }, maxWidth: { lg: 680 } }}>
            {/* Live Indicator Badge */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', mb: 3 }}>
              <Chip
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#22c55e',
                      boxShadow: '0 0 10px #22c55e',
                      ml: '10px !important',
                      mr: '-4px !important',
                    }}
                  />
                }
                label="DEVMEET EGYPT • لمة مبرمجين 🇪🇬"
                sx={{
                  bgcolor: 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${tokens.primary}40`,
                  color: tokens.primary,
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

            {/* Conference Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.7rem', sm: '3.8rem', md: '4.4rem', lg: '4.8rem' },
                fontWeight: 900,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                color: '#ffffff',
                mb: 2.5,
              }}
            >
              Where Egypt's Top Engineers{' '}
              <Box
                component="span"
                sx={{
                  color: tokens.primary,
                  display: 'inline',
                  textShadow: '0 0 45px rgba(245, 158, 11, 0.45)',
                }}
              >
                Connect.
              </Box>
            </Typography>

            {/* Sub-headline */}
            <Typography
              sx={{
                fontSize: { xs: '1.05rem', sm: '1.18rem' },
                color: tokens.textSecondary,
                lineHeight: 1.7,
                mb: 4.5,
                maxWidth: 620,
                fontWeight: 400,
              }}
            >
              Discover elite Egyptian tech gatherings, architecture masterclasses, and hands-on workshops across Cairo, Giza, Alexandria, and beyond.
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                mb: 5,
              }}
            >
              <Button
                component={Link}
                to="/activities"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  px: 3.8,
                  py: 1.35,
                  bgcolor: tokens.primary,
                  color: tokens.bg,
                  borderRadius: '14px',
                  boxShadow: tokens.shadowGold,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: '#e08e0a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 28px rgba(245, 158, 11, 0.4)',
                  },
                }}
              >
                Explore All Meetups
              </Button>

              <Button
                component={Link}
                to="/createActivity"
                variant="outlined"
                size="large"
                startIcon={<AddIcon />}
                sx={{
                  fontSize: '0.98rem',
                  fontWeight: 700,
                  px: 3.2,
                  py: 1.35,
                  color: tokens.textPrimary,
                  borderColor: tokens.border,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '14px',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: tokens.primary,
                    color: tokens.primary,
                    bgcolor: `${tokens.primary}12`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Host a Meetup
              </Button>
            </Box>

            {/* Quick Metrics Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: { xs: 2.5, sm: 4 },
                pt: 3.5,
                borderTop: `1px solid ${tokens.border}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <GroupsIcon sx={{ fontSize: 20, color: tokens.primary }} />
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: tokens.textPrimary, lineHeight: 1 }}>
                    {stats?.activeDevelopers ? `+${stats.activeDevelopers.toLocaleString()}` : '+1,200'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted, mt: 0.3 }}>
                    Active Engineers
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <EventAvailableIcon sx={{ fontSize: 20, color: tokens.teal }} />
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: tokens.textPrimary, lineHeight: 1 }}>
                    {stats?.totalEvents ? `+${stats.totalEvents.toLocaleString()}` : '+340'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted, mt: 0.3 }}>
                    Events Hosted
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <TerminalIcon sx={{ fontSize: 20, color: tokens.accent }} />
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: tokens.textPrimary, lineHeight: 1 }}>
                    5 Core Tracks
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted, mt: 0.3 }}>
                    Backend, DevOps & AI
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right Column (40%) - Holographic Ticket Pass */}
          <Box
            sx={{
              flex: { xs: '1 1 100%', lg: '1 1 42%' },
              display: 'flex',
              justifyContent: { xs: 'center', lg: 'flex-end' },
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Ambient Back Glow */}
            <Box
              sx={{
                position: 'absolute',
                width: 360,
                height: 360,
                borderRadius: '50%',
                bgcolor: `${tokens.primary}20`,
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            />

            {featuredActivity ? (
              <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', justifyContent: 'center' }}>
                <FeaturedEventCard activity={featuredActivity} />
              </Box>
            ) : (
              /* Fallback Preview Ticket */
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  maxWidth: 460,
                  p: 4,
                  bgcolor: tokens.surface,
                  borderRadius: '24px',
                  border: `1px solid ${tokens.border}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.textPrimary, mb: 1 }}>
                  Next Egypt Flagship Meetup
                </Typography>
                <Typography variant="body2" sx={{ color: tokens.textSecondary, mb: 3 }}>
                  Stay tuned! New engineering workshops and tech summits are announced weekly.
                </Typography>
                <Button component={Link} to="/activities" variant="contained" sx={{ bgcolor: tokens.primary, color: tokens.bg }}>
                  Browse All Meetups
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
