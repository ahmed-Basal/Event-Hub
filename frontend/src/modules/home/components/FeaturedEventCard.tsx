'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Button, Chip, Typography } from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CalendarMonth as CalendarMonthIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getCategoryImage, type Activity } from '@modules/activities';
import { formatLocalDateTime } from '@/core/utils/dateUtils';
import { tokens } from '@/theme/tokens';

function useCountdown(targetDate?: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff / 3_600_000) % 24),
        mins: Math.floor((diff / 60_000) % 60),
        secs: Math.floor((diff / 1_000) % 60),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

export default function FeaturedEventCard({ activity }: { activity: Activity }) {
  const countdown = useCountdown(activity.date);
  const formattedMonth = activity.date ? format(new Date(activity.date), 'MMM') : 'OCT';
  const formattedDay = activity.date ? format(new Date(activity.date), 'dd') : '25';
  const formattedFullDate = activity.date
    ? formatLocalDateTime(activity.date, 'EEEE, dd MMM yyyy • h:mm a')
    : 'Date to be announced';

  const cover = getCategoryImage(activity.category, activity.image);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: 460, lg: 470 },
        position: 'relative',
        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))',
        transition: 'transform 0.3s ease, filter 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          filter: `drop-shadow(0 25px 50px ${tokens.primaryGlow})`,
        },
      }}
    >
      {/* Holographic Sky + Teal Border Wrap */}
      <Box
        sx={{
          p: '1.5px',
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.teal} 55%, ${tokens.primaryLight} 100%)`,
        }}
      >
        <Box
          sx={{
            bgcolor: '#0e1320',
            borderRadius: '23px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Ticket Header Strip */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1.5,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px dashed rgba(255, 255, 255, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ConfirmationNumberIcon sx={{ fontSize: 16, color: tokens.primary }} />
              <Typography
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: tokens.textSecondary,
                  textTransform: 'uppercase',
                }}
              >
                FLAGSHIP MEETUP PASS
              </Typography>
            </Box>

            <Chip
              label={`🔥 HOT #1 • ${activity.price && activity.price > 0 ? `$${activity.price}` : 'FREE'}`}
              size="small"
              sx={{
                bgcolor: `${tokens.accent}22`,
                color: tokens.accent,
                border: `1px solid ${tokens.accent}55`,
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                height: 22,
              }}
            />
          </Box>

          {/* Artwork Banner */}
          <Box sx={{ height: 195, position: 'relative' }}>
            <Image
              src={cover}
              alt={activity.title}
              fill
              priority
              sizes="470px"
              style={{ objectFit: 'cover' }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(14, 19, 32, 0.2) 0%, rgba(14, 19, 32, 0.85) 80%, #0e1320 100%)',
              }}
            />

            <Box
              sx={{
                position: 'absolute',
                top: 14,
                left: 16,
                bgcolor: 'rgba(11, 15, 25, 0.88)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${tokens.border}`,
                borderRadius: '12px',
                px: 1.6,
                py: 0.6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: tokens.primaryLight, textTransform: 'uppercase' }}>
                {formattedMonth}
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                {formattedDay}
              </Typography>
            </Box>
          </Box>

          {/* Ticket Body */}
          <Box sx={{ px: 3, pb: 3, pt: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.3 }}>
              {activity.title}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 16, color: tokens.primary }} />
                <Typography variant="caption" color="text.secondary">
                  {formattedFullDate}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOnIcon sx={{ fontSize: 16, color: tokens.teal }} />
                <Typography variant="caption" color="text.secondary">
                  {activity.venue}, {activity.city}
                </Typography>
              </Box>
            </Box>

            {activity.tags?.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {activity.tags.slice(0, 4).map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      bgcolor: tokens.surface2,
                      color: tokens.textSecondary,
                      border: `1px solid ${tokens.border}`,
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Countdown Strip */}
            {new Date(activity.date).getTime() <= Date.now() ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" fontWeight={700} color={tokens.textSecondary}>
                  Event Completed
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: tokens.surface,
                  border: `1px solid ${tokens.border}`,
                }}
              >
                {[
                  { label: 'Days', val: countdown.days },
                  { label: 'Hours', val: countdown.hours },
                  { label: 'Mins', val: countdown.mins },
                  { label: 'Secs', val: countdown.secs },
                ].map((item) => (
                  <Box key={item.label} textAlign="center">
                    <Typography variant="h6" fontWeight={800} color={tokens.primaryLight} lineHeight={1.1}>
                      {String(item.val).padStart(2, '0')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.68rem">
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              component={Link}
              href={`/activities/${activity.id}`}
              variant="contained"
              fullWidth
              endIcon={<ArrowForwardIcon />}
              sx={{ py: 1.2, borderRadius: '12px', fontWeight: 700 }}
            >
              Reserve Your Spot
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
