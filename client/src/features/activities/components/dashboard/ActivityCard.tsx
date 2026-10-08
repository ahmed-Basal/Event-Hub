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
import { Link } from 'react-router';
import { TagList, formatDate, formatDateOnly, formatTimeOnly } from '../../../shared';
import { tokens } from '../../../theme';

export interface ActivityCardData {
  id: string;
  title: string;
  date: string;
  category: string;
  image?: string;
  tags?: string[];
  venue: string;
  city: string;
  slug?: string;
  isCancelled?: boolean;
}

export type ActivityCardProps =
  | ActivityCardData
  | { activity: ActivityCardData };

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  backend: { color: tokens.teal, bg: `${tokens.teal}20` },
  frontend: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  cybersecurity: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  dataanalysis: { color: tokens.accent, bg: `${tokens.accent}18` },
  devops: { color: tokens.primary, bg: `${tokens.primary}18` },
};

// Colored avatar badges for attendees
const DUMMY_ATTENDEES = [
  { initials: 'A', color: tokens.teal },
  { initials: 'M', color: tokens.primary },
  { initials: 'S', color: tokens.accent },
];

export default function ActivityCard(props: ActivityCardProps) {
  const activity = 'activity' in props && props.activity ? props.activity : (props as ActivityCardData);
  const [bookmarked, setBookmarked] = useState(false);
  const isCancelled = Boolean(activity.isCancelled);
  const catKey = activity.category?.toLowerCase() ?? 'backend';
  const catStyle = CATEGORY_COLORS[catKey] ?? { color: tokens.textSecondary, bg: 'rgba(255,255,255,0.07)' };
  const coverImg = activity.image || `/images/categoryImages/${catKey}.jpg`;

  const dayStr = formatDate(activity.date, 'dd');
  const monthStr = formatDate(activity.date, 'MMM').toUpperCase();
  const timeStr = formatTimeOnly(activity.date);

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        opacity: isCancelled ? 0.55 : 1,
        borderRadius: '20px',
        border: `1px solid ${tokens.border}`,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: tokens.shadowCard,
          borderColor: tokens.borderHover,
          '& .activity-cover-img': {
            transform: 'scale(1.04)',
          },
        },
      }}
    >

      <Box
        sx={{
          height: 210,
          position: 'relative',
          bgcolor: tokens.surface2,
          overflow: 'hidden',
        }}
      >
        <Box
          className="activity-cover-img"
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${coverImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(8,12,20,0) 30%, rgba(8,12,20,0.85) 100%)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            bgcolor: 'rgba(17,23,34,0.9)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${tokens.border}`,
            borderRadius: '12px',
            px: 1.4,
            py: 0.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <Typography
            sx={{ fontSize: '0.6rem', color: tokens.primary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}
          >
            {monthStr}
          </Typography>
          <Typography sx={{ fontSize: '1.35rem', fontWeight: 900, color: tokens.textPrimary, lineHeight: 1.1 }}>
            {dayStr}
          </Typography>
        </Box>

        {isCancelled ? (
          <Chip
            label="Cancelled"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 14,
              left: 14,
              bgcolor: 'rgba(255,70,85,0.25)',
              color: tokens.accent,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${tokens.accent}55`,
              fontSize: '0.7rem',
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
              backdropFilter: 'blur(8px)',
              boxShadow: tokens.shadowCoral,
              fontSize: '0.7rem',
              fontWeight: 700,
            }}
          />
        )}

        <IconButton
          onClick={() => setBookmarked(!bookmarked)}
          size="small"
          aria-label="Bookmark event"
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            bgcolor: 'rgba(17,23,34,0.8)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${tokens.border}`,
            color: bookmarked ? tokens.primary : tokens.textSecondary,
            width: 36,
            height: 36,
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { bgcolor: 'rgba(17,23,34,0.95)', transform: 'scale(1.08)' },
          }}
        >
          {bookmarked ? <BookmarkIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      <Box sx={{ p: 2.5 }}>

        <Chip
          label={activity.category}
          size="small"
          sx={{
            bgcolor: catStyle.bg,
            color: catStyle.color,
            border: `1px solid ${catStyle.color}44`,
            fontSize: '0.7rem',
            fontWeight: 700,
            mb: 1.2,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        />

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.35,
            mb: 1.5,
            color: tokens.textPrimary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            letterSpacing: '-0.01em',
          }}
        >
          {activity.title}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: tokens.primary }} />
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
              {formatDateOnly(activity.date)} — {timeStr}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ fontSize: 14, color: tokens.accent }} />
            <Typography sx={{ fontSize: '0.82rem', color: tokens.textSecondary, fontWeight: 500 }}>
              {activity.venue}{activity.city ? `, ${activity.city}` : ''}
            </Typography>
          </Box>
        </Box>

        <TagList
          tags={activity.tags}
          maxVisible={3}
          size="small"
          sx={{ mb: 2 }}
        />

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, my: 1.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', '& > *:not(:first-of-type)': { ml: '-10px' } }}>
              {DUMMY_ATTENDEES.map((a) => (
                <Box
                  key={a.initials}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: a.color,
                    color: tokens.bg,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `2px solid ${tokens.surface}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  {a.initials}
                </Box>
              ))}
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: tokens.textMuted, fontWeight: 500 }}>
              +120 going
            </Typography>
          </Box>

          <Button
            component={Link}
            to={activity.slug ? `/activities/${activity.id}/${activity.slug}` : `/activities/${activity.id}`}
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.8rem',
              px: 2.2,
              py: 0.7,
              borderRadius: '9999px',
              borderColor: tokens.border,
              color: tokens.textPrimary,
              bgcolor: 'rgba(255,255,255,0.02)',
              '&:hover': {
                borderColor: tokens.primary,
                color: tokens.primary,
                bgcolor: `${tokens.primary}15`,
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
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
