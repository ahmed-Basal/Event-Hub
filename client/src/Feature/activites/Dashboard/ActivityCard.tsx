import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Link } from 'react-router';
import { format } from 'date-fns';
import type { Activity } from '../../../lib/Types';
import { tokens } from '../../../theme/theme';

type Props = { activity: Activity };

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  backend:      { color: tokens.teal,    bg: `${tokens.teal}20` },
  frontend:     { color: '#a78bfa',      bg: 'rgba(167,139,250,0.15)' },
  cybersecurity:{ color: '#4ade80',      bg: 'rgba(74,222,128,0.12)' },
  dataanalysis: { color: tokens.accent,  bg: `${tokens.accent}18` },
  devops:       { color: tokens.primary, bg: `${tokens.primary}18` },
};

// Fake colored avatars for attendees
const DUMMY_ATTENDEES = [
  { initials: 'A', color: tokens.teal },
  { initials: 'M', color: tokens.primary },
  { initials: 'S', color: tokens.accent },
];

export default function ActivityCard({ activity }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const isCancelled = activity.isCancelled;
  const catKey = activity.category?.toLowerCase() ?? 'backend';
  const catStyle = CATEGORY_COLORS[catKey] ?? { color: tokens.textSecondary, bg: 'rgba(255,255,255,0.07)' };
  const coverImg = `/images/categoryImages/${catKey}.jpg`;

  const eventDate = new Date(activity.date);
  const dayStr = format(eventDate, 'dd');
  const monthStr = format(eventDate, 'MMM').toUpperCase();
  const timeStr = format(eventDate, 'h:mm a');

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        opacity: isCancelled ? 0.55 : 1,
      }}
    >
      {/* ── Cover Image ─────────────────────────────── */}
      <Box
        sx={{
          height: 200,
          position: 'relative',
          bgcolor: tokens.surface2,
          backgroundImage: `url(${coverImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* Date badge — top left */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            bgcolor: 'rgba(11,15,25,0.88)',
            border: `1px solid ${tokens.border}`,
            borderRadius: '11px',
            px: 1.2,
            py: 0.4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 48,
          }}
        >
          <Typography
            sx={{ fontSize: '0.58rem', color: tokens.primary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}
          >
            {monthStr}
          </Typography>
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: tokens.textPrimary, lineHeight: 1.1 }}>
            {dayStr}
          </Typography>
        </Box>

        {/* Status badge — bottom left */}
        {isCancelled ? (
          <Chip
            label="Cancelled"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              bgcolor: 'rgba(255,70,85,0.22)',
              color: tokens.accent,
              border: `1px solid ${tokens.accent}55`,
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
          />
        ) : (
          <Chip
            label="🔥 Limited Spots"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              bgcolor: tokens.accent,
              color: '#fff',
              fontSize: '0.68rem',
              fontWeight: 700,
            }}
          />
        )}

        {/* Bookmark button — top right */}
        <IconButton
          onClick={() => setBookmarked(!bookmarked)}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            bgcolor: 'rgba(11,15,25,0.76)',
            border: `1px solid ${tokens.border}`,
            color: bookmarked ? tokens.primary : tokens.textMuted,
            width: 34,
            height: 34,
            transition: 'color 0.2s, background 0.2s',
            '&:hover': { bgcolor: 'rgba(11,15,25,0.9)' },
          }}
        >
          {bookmarked ? <BookmarkIcon sx={{ fontSize: 17 }} /> : <BookmarkBorderIcon sx={{ fontSize: 17 }} />}
        </IconButton>
      </Box>

      {/* ── Card Body ────────────────────────────────── */}
      <Box sx={{ p: 2.2 }}>
        {/* Category chip */}
        <Chip
          label={activity.category}
          size="small"
          sx={{
            bgcolor: catStyle.bg,
            color: catStyle.color,
            border: `1px solid ${catStyle.color}44`,
            fontSize: '0.67rem',
            fontWeight: 700,
            mb: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        />

        {/* Title */}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            lineHeight: 1.35,
            mb: 1.4,
            color: tokens.textPrimary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {activity.title}
        </Typography>

        {/* Date & Location */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <CalendarTodayIcon sx={{ fontSize: 13, color: tokens.textMuted }} />
            <Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary }}>
              {format(eventDate, 'dd MMM yyyy')} — {timeStr}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <LocationOnIcon sx={{ fontSize: 13, color: tokens.textMuted }} />
            <Typography sx={{ fontSize: '0.78rem', color: tokens.textSecondary }}>
              {activity.venue}{activity.city ? `, ${activity.city}` : ''}
            </Typography>
          </Box>
        </Box>

        {/* Tags */}
        {activity.tags && activity.tags.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap', mb: 1.8 }}>
            <LocalOfferIcon sx={{ fontSize: 12, color: tokens.textMuted }} />
            {activity.tags.slice(0, 3).map((tag) => (
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.05)',
                  color: tokens.textMuted,
                  border: `1px solid ${tokens.border}`,
                  fontSize: '0.65rem',
                  height: 20,
                }}
              />
            ))}
          </Box>
        )}

        {/* Divider */}
        <Box sx={{ borderTop: `1px solid ${tokens.border}`, my: 1.5 }} />

        {/* Bottom row: attendees + book button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Attendee avatars */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Box sx={{ display: 'flex', '& > *:not(:first-of-type)': { ml: '-8px' } }}>
              {DUMMY_ATTENDEES.map((a) => (
                <Box
                  key={a.initials}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: a.color,
                    color: tokens.bg,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${tokens.surface}`,
                  }}
                >
                  {a.initials}
                </Box>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: tokens.textMuted }}>
              +120 attending
            </Typography>
          </Box>

          {/* Book button */}
          <Button
            component={Link}
            to={`/activities/${activity.slug || activity.id}`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.78rem',
              px: 2,
              py: 0.6,
              borderColor: tokens.border,
              color: tokens.textSecondary,
              '&:hover': {
                borderColor: tokens.primary,
                color: tokens.primary,
                bgcolor: `${tokens.primary}10`,
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
