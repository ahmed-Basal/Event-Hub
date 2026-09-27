import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import NavBar from '../../App/Layout/NavBar';
import { Link } from 'react-router';
import { tokens } from '../../theme/theme';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import useactivites from '../../lib/Hooks/useactivites';
import { format } from 'date-fns';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// ── Countdown Timer ─────────────────────────────────────────────────────────
function useCountdown(targetDate?: string) {
  const [time, setTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return time;
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 52 }}>
      <Box
        sx={{
          bgcolor: 'rgba(11,15,25,0.85)',
          border: `1px solid ${tokens.border}`,
          borderRadius: '12px',
          px: 1.5,
          py: 0.5,
          fontSize: '1.5rem',
          fontWeight: 700,
          color: tokens.textPrimary,
          fontVariantNumeric: 'tabular-nums',
          minWidth: 52,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        {String(value).padStart(2, '0')}
      </Box>
      <Typography sx={{ fontSize: '0.62rem', color: tokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.4 }}>
        {label}
      </Typography>
    </Box>
  );
}

// ── Stats Bar ────────────────────────────────────────────────────────────────
const STATS = [
  { icon: <GroupIcon sx={{ fontSize: 20, color: tokens.primary }} />, value: '+1,200', label: 'Active Developers' },
  { icon: <EmojiEventsIcon sx={{ fontSize: 20, color: tokens.accent }} />, value: '+340', label: 'Events Hosted' },
  { icon: <CodeIcon sx={{ fontSize: 20, color: tokens.teal }} />, value: '5', label: 'Tech Tracks' },
];

// ── Main Component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const { activities } = useactivites();
  const featured = activities?.[0];
  const countdown = useCountdown(featured?.date);

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
      {/* ── NavBar ── */}
      <NavBar />

      {/* ── Hero Section ── */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          minHeight: { xs: 520, md: 620 },
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient + subtle grid */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 65%),
              radial-gradient(ellipse 50% 40% at 85% 80%, rgba(255,70,85,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 40% 50% at 15% 70%, rgba(6,182,212,0.07) 0%, transparent 55%)
            `,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              alignItems: 'center',
              gap: { xs: 5, lg: 8 },
              py: { xs: 5, md: 8 },
            }}
          >
            {/* Left — Brand & CTA ─────────── */}
            <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: 580 } }}>
              {/* Badge */}
              <Chip
                label="🇪🇬 Egyptian Developer Community"
                sx={{
                  bgcolor: `${tokens.primary}18`,
                  border: `1px solid ${tokens.primary}44`,
                  color: tokens.primary,
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  mb: 3,
                  letterSpacing: '0.03em',
                }}
              />

              {/* Main Heading */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '3rem', sm: '4.2rem', md: '5rem' },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.04em',
                  mb: 2,
                  textAlign: { xs: 'center', lg: 'left' },
                }}
              >
                لمه{' '}
                <Box
                  component="span"
                  sx={{
                    color: tokens.primary,
                    textShadow: '0 0 40px rgba(245,158,11,0.4)',
                  }}
                >
                  مبرمجين
                </Box>
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  color: tokens.textSecondary,
                  lineHeight: 1.7,
                  mb: 4,
                  textAlign: { xs: 'center', lg: 'left' },
                  maxWidth: 520,
                  mr: { lg: 'auto' },
                }}
              >
                The premier hub to connect with software engineers and attend top-tier tech events in Egypt. Workshops, hackathons, conferences, and more.
              </Typography>

              {/* CTA Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                }}
              >
                <Button
                  component={Link}
                  to="/activities"
                  variant="contained"
                  color="secondary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ fontSize: '1rem', px: 3.5, py: 1.3 }}
                >
                  Explore Events
                </Button>
                <Button
                  component={Link}
                  to="/createActivity"
                  variant="outlined"
                  size="large"
                  sx={{ fontSize: '1rem', px: 3 }}
                >
                  Host an Event
                </Button>
              </Box>
            </Box>

            {/* Right — Featured Event Card ─── */}
            {featured && (
              <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: 440 }, width: '100%' }}>
                <Box
                  sx={{
                    bgcolor: tokens.surface,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: tokens.shadowCard,
                    position: 'relative',
                  }}
                >
                  {/* Cover image area */}
                  <Box
                    sx={{
                      height: 220,
                      position: 'relative',
                      bgcolor: tokens.surface2,
                      backgroundImage: `url(/images/categoryImages/${featured.category?.toLowerCase() || 'backend'}.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Gradient overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)',
                      }}
                    />

                    {/* Date badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(11,15,25,0.91)',
                        border: `1px solid ${tokens.border}`,
                        borderRadius: '12px',
                        px: 1.5,
                        py: 0.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: 52,
                      }}
                    >
                      <Typography sx={{ fontSize: '0.6rem', color: tokens.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {format(new Date(featured.date), 'MMM')}
                      </Typography>
                      <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.1 }}>
                        {format(new Date(featured.date), 'dd')}
                      </Typography>
                    </Box>

                    {/* Selling fast badge */}
                    <Chip
                      label="🔥 Featured"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        bgcolor: tokens.accent,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        boxShadow: tokens.shadowCoral,
                      }}
                    />
                  </Box>

                  {/* Card body */}
                  <Box sx={{ p: 2.5 }}>
                    <Chip
                      label={featured.category}
                      size="small"
                      sx={{
                        bgcolor: `${tokens.teal}20`,
                        color: tokens.teal,
                        border: `1px solid ${tokens.teal}40`,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    />

                    <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.35, mb: 1.5 }}>
                      {featured.title}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <CalendarTodayIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
                        <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>
                          {format(new Date(featured.date), 'dd MMM yyyy — h:mm a')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
                        <Typography sx={{ fontSize: '0.8rem', color: tokens.textSecondary }}>
                          {featured.venue}{featured.city ? `, ${featured.city}` : ''}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Countdown */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2.5,
                        pb: 2,
                        borderBottom: `1px solid ${tokens.border}`,
                      }}
                    >
                      <CountdownBox value={countdown.days} label="Days" />
                      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
                      <CountdownBox value={countdown.hours} label="Hours" />
                      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
                      <CountdownBox value={countdown.mins} label="Mins" />
                      <Typography sx={{ color: tokens.textMuted, fontSize: '1.3rem', fontWeight: 300, mb: 1.5 }}>:</Typography>
                      <CountdownBox value={countdown.secs} label="Secs" />
                    </Box>

                    {/* Book button */}
                    <Button
                      component={Link}
                      to={`/activities/${featured.slug || featured.id}`}
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ fontWeight: 700 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* ── Stats Bar ── */}
      <Box sx={{ borderTop: `1px solid ${tokens.border}`, borderBottom: `1px solid ${tokens.border}`, bgcolor: tokens.surface }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'flex',
              justifyContent: { xs: 'center', md: 'center' },
              flexWrap: 'wrap',
              gap: { xs: 4, md: 10 },
              py: 3,
            }}
          >
            {STATS.map((s) => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {s.icon}
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: tokens.textPrimary, lineHeight: 1.2 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted }}>
                    {s.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}