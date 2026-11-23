'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getCategoryImage, type Activity } from '@features/Activities/Frontend';
import { formatLocalDateTime } from '@/core/utils/dateUtils';
import { useBookmarks } from '@features/Activities/Frontend';
import { tokens } from '@/theme/tokens';
import { AvatarPopover } from '@features/Profiles/Frontend';

interface ActivityCardProps {
  activity: Activity;
  currentUsername?: string | null;
}

export default function ActivityCard({ activity, currentUsername }: ActivityCardProps) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(activity.id);

  const isHost = Boolean(currentUsername && activity.hostUsername === currentUsername);
  const isGoing = Boolean(
    currentUsername && activity.attendees.some((a) => a.username === currentUsername)
  );
  const cover = getCategoryImage(activity.category, activity.image);

  return (
    <Card
      sx={{
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: tokens.borderHover,
          boxShadow: `0 20px 44px rgba(0, 0, 0, 0.55), 0 0 0 1px ${tokens.primary}44`,
        },
      }}
    >
      {/* Cover Image Header — Your Original DevMeet Card Aesthetic */}
      <Box sx={{ position: 'relative', height: 175, width: '100%' }}>
        <Image
          src={cover}
          alt={activity.title}
          fill
          sizes="(max-width: 900px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(10,14,26,0.15) 0%, rgba(19,26,45,0.92) 100%)',
          }}
        />

        {/* Status Badges */}
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {activity.isCancelled && (
            <Chip
              label="Cancelled"
              size="small"
              sx={{ bgcolor: tokens.accent, color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
          {isHost && (
            <Chip
              label="Hosting"
              size="small"
              sx={{ bgcolor: `${tokens.primary}dd`, color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}
            />
          )}
          {!isHost && isGoing && (
            <Chip
              label="Going"
              size="small"
              sx={{ bgcolor: `${tokens.teal}dd`, color: '#0A0E1A', fontSize: '0.7rem', fontWeight: 800 }}
            />
          )}
          <Chip
            label={activity.price && activity.price > 0 ? `$${activity.price}` : 'Free'}
            size="small"
            sx={{
              bgcolor: activity.price && activity.price > 0 ? `${tokens.gold}ee` : 'rgba(10,14,26,0.82)',
              color: activity.price && activity.price > 0 ? '#0A0E1A' : tokens.teal,
              border: `1px solid ${activity.price && activity.price > 0 ? tokens.gold : `${tokens.teal}66`}`,
              fontSize: '0.7rem',
              fontWeight: 800,
            }}
          />
        </Box>

        <IconButton
          onClick={() => toggleBookmark(activity.id)}
          size="small"
          aria-label="Bookmark event"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(10, 14, 26, 0.78)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${tokens.border}`,
            color: bookmarked ? tokens.primaryLight : tokens.textSecondary,
            width: 34,
            height: 34,
            '&:hover': { bgcolor: 'rgba(10, 14, 26, 0.95)' },
          }}
        >
          {bookmarked ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Card Body */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Chip
          label={activity.category}
          size="small"
          sx={{
            alignSelf: 'flex-start',
            bgcolor: `${tokens.primary}1a`,
            color: tokens.primaryLight,
            border: `1px solid ${tokens.primary}44`,
            fontSize: '0.68rem',
            fontWeight: 700,
            mb: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        />

        <Typography
          component={Link}
          href={`/activities/${activity.id}`}
          sx={{
            fontWeight: 700,
            fontSize: '1.08rem',
            lineHeight: 1.35,
            mb: 1.2,
            color: tokens.textPrimary,
            textDecoration: 'none',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            '&:hover': { color: tokens.primaryLight },
          }}
        >
          {activity.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: tokens.primary }} />
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
              {formatLocalDateTime(activity.date)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: tokens.teal }} />
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
              {activity.venue}{activity.city ? `, ${activity.city}` : ''}
            </Typography>
          </Box>
        </Box>

        {activity.tags?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
            {activity.tags.slice(0, 3).map((tag) => (
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

        <Box sx={{ mt: 'auto', borderTop: `1px solid ${tokens.border}`, pt: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {/* Real Attendees with Hover ProfileCard Popover */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {activity.attendees.slice(0, 4).map((att) => (
                <AvatarPopover key={att.username} attendee={att} />
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted, fontWeight: 600 }}>
              {activity.attendees.length} going
            </Typography>
          </Box>

          <Button
            component={Link}
            href={`/activities/${activity.id}`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.8rem',
              px: 2.2,
              py: 0.65,
              borderRadius: '9999px',
              borderColor: tokens.border,
              color: tokens.textPrimary,
              '&:hover': {
                borderColor: tokens.primary,
                color: tokens.primaryLight,
                bgcolor: `${tokens.primary}18`,
              },
            }}
          >
            View Event
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
