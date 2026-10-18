import { useState, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { Link } from 'react-router';
import { tokens } from '../../../theme';
import type { Activity } from '../../../shared';
import { ActivityCard } from '../../activities';

export interface UpcomingEventsProps {
  activities?: Activity[];
  selectedTrack?: string;
  onResetTrack?: () => void;
}

export default function UpcomingEvents({
  activities = [],
  selectedTrack = 'all',
  onResetTrack,
}: UpcomingEventsProps) {
  const isFiltered = selectedTrack !== 'all';
  const sliderRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < maxScroll - 6);

    const firstChild = el.firstElementChild as HTMLElement | null;
    if (firstChild) {
      const cardWidth = firstChild.offsetWidth + 24; // width + gap
      const newIndex = Math.min(
        Math.max(0, Math.round(scrollLeft / cardWidth)),
        activities.length - 1
      );
      setActiveIndex(newIndex);
    }
  }, [activities.length]);

  useEffect(() => {
    updateScrollState();
    const el = sliderRef.current;
    if (!el) return;

    const handleScroll = () => {
      window.requestAnimationFrame(updateScrollState);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScrollState);

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  const scrollByCard = (direction: 'prev' | 'next') => {
    const el = sliderRef.current;
    if (!el) return;

    const firstChild = el.firstElementChild as HTMLElement | null;
    const step = firstChild ? firstChild.offsetWidth + 24 : 360;

    el.scrollBy({
      left: direction === 'next' ? step : -step,
      behavior: 'smooth',
    });
  };

  const scrollToIndex = (index: number) => {
    const el = sliderRef.current;
    if (!el) return;

    const targetChild = el.children[index] as HTMLElement | null;
    if (targetChild) {
      targetChild.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollByCard('prev');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollByCard('next');
    }
  };

  return (
    <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: tokens.bg }}>
      <Container maxWidth="xl">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 3,
            mb: 4.5,
          }}
        >
          <Box sx={{ maxWidth: 720 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Typography
                variant="h2"
                component="h2"
                sx={{
                  fontSize: { xs: '1.9rem', sm: '2.4rem', md: '2.75rem' },
                  fontWeight: 900,
                  color: tokens.textPrimary,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                }}
              >
                Scheduled Meetups & Workshops
              </Typography>

              {isFiltered && (
                <Chip
                  label={`Track: ${selectedTrack.toUpperCase()}`}
                  size="small"
                  onDelete={onResetTrack}
                  sx={{
                    bgcolor: `${tokens.primary}22`,
                    color: tokens.primary,
                    border: `1px solid ${tokens.primary}50`,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 26,
                  }}
                />
              )}
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: tokens.textSecondary,
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                lineHeight: 1.6,
              }}
            >
              Hand-picked engineering gatherings, architecture sessions, and technical workshops across Egypt.
            </Typography>
          </Box>

          {/* Action and Navigation Controls */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              alignSelf: { xs: 'stretch', sm: 'flex-end' },
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              flexWrap: 'wrap',
            }}
          >
            <Button
              component={Link}
              to="/activities"
              endIcon={<ArrowForwardIcon />}
              sx={{
                color: tokens.teal,
                fontWeight: 700,
                fontSize: '0.92rem',
                px: 1,
                py: 0.8,
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: tokens.primary,
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              All Meetups ({activities.length})
            </Button>

            {activities.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => scrollByCard('prev')}
                  disabled={!canScrollLeft}
                  aria-label="Previous events"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${tokens.border}`,
                    color: tokens.textPrimary,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      borderColor: tokens.primary,
                      color: tokens.primary,
                      boxShadow: tokens.primaryGlow,
                      transform: 'translateX(-2px)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.3,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                      color: tokens.textMuted,
                    },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>

                <IconButton
                  onClick={() => scrollByCard('next')}
                  disabled={!canScrollRight}
                  aria-label="Next events"
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: '12px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${tokens.border}`,
                    color: tokens.textPrimary,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      borderColor: tokens.primary,
                      color: tokens.primary,
                      boxShadow: tokens.primaryGlow,
                      transform: 'translateX(2px)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.3,
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                      color: tokens.textMuted,
                    },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Box>

        {/* Empty State for Filtered Track */}
        {activities.length === 0 ? (
          <Box
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: '24px',
              bgcolor: tokens.surface,
              border: `1px dashed ${tokens.border}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              my: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: tokens.textPrimary }}>
              No meetups scheduled for this track yet
            </Typography>
            <Typography variant="body2" sx={{ color: tokens.textSecondary, maxWidth: 500, lineHeight: 1.6 }}>
              Be the first engineer to organize a meetup in this category, or reset the track filter to browse all available sessions.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              {onResetTrack && (
                <Button
                  variant="outlined"
                  onClick={onResetTrack}
                  startIcon={<RestartAltIcon />}
                  sx={{ borderColor: tokens.border, color: tokens.textPrimary }}
                >
                  View All Tracks
                </Button>
              )}
              <Button
                component={Link}
                to="/createActivity"
                variant="contained"
                sx={{ bgcolor: tokens.primary, color: tokens.bg, fontWeight: 700 }}
              >
                Host Meetup in This Track
              </Button>
            </Box>
          </Box>
        ) : (
          /* Interactive Carousel / Slider */
          <Box sx={{ position: 'relative' }}>
            <Box
              ref={sliderRef}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="Upcoming Meetups Carousel"
              onKeyDown={handleKeyDown}
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                py: 2.5,
                my: -2.5,
                px: { xs: 0.5, sm: 0 },
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                WebkitOverflowScrolling: 'touch',
                outline: 'none',
                '&:focus-visible': {
                  boxShadow: `0 0 0 2px ${tokens.primary}`,
                  borderRadius: '24px',
                },
              }}
            >
              {activities.map((act, index) => (
                <Box
                  key={act.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${activities.length}`}
                  sx={{
                    flex: {
                      xs: '0 0 88%',
                      sm: '0 0 calc(50% - 12px)',
                      lg: '0 0 calc(33.333% - 16px)',
                    },
                    minWidth: { xs: 280, sm: 320 },
                    maxWidth: { xs: 380, sm: 'none' },
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                  }}
                >
                  <ActivityCard activity={act} />
                </Box>
              ))}
            </Box>

            {/* Pagination Indicators */}
            {activities.length > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 4,
                }}
              >
                {activities.map((act, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <Box
                      key={`dot-${act.id}`}
                      component="button"
                      type="button"
                      onClick={() => scrollToIndex(index)}
                      aria-label={`Jump to event ${index + 1}`}
                      sx={{
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        height: 6,
                        width: isActive ? 28 : 8,
                        borderRadius: '9999px',
                        bgcolor: isActive ? tokens.primary : 'rgba(255, 255, 255, 0.18)',
                        boxShadow: isActive ? tokens.primaryGlow : 'none',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': {
                          bgcolor: isActive ? tokens.primary : 'rgba(255, 255, 255, 0.4)',
                        },
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
