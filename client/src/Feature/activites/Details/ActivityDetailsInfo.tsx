import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PlaceIcon from '@mui/icons-material/Place';
import SchoolIcon from '@mui/icons-material/School';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArticleIcon from '@mui/icons-material/Article';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDate } from '../../../lib/UTlity/Utle';
import { GradientTag } from '../../../lib/UTlity/tagUtils';
import type { Activity } from '../../../lib/Types';
import { tokens } from '../../../theme/theme';

type Props = {
  activity: Activity;
};

export default function ActivityDetailsInfo({ activity }: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
      {/* ── 1. About / Description Card ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '20px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: `${tokens.primary}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
            }}
          >
            <ArticleIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
            About this Meetup
          </Typography>
        </Box>

        <Typography
          sx={{
            color: tokens.textSecondary,
            lineHeight: 1.8,
            fontSize: '0.98rem',
            whiteSpace: 'pre-line',
          }}
        >
          {activity?.description}
        </Typography>

        {/* Tags Row */}
        {activity?.tags && activity.tags.length > 0 && (
          <Box sx={{ mt: 3, pt: 2.5, borderTop: `1px solid ${tokens.border}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <LocalOfferIcon sx={{ fontSize: 16, color: tokens.primary }} />
              <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Key Technologies &amp; Topics
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activity.tags.map((tag, idx) => (
                <GradientTag key={tag} tag={tag} index={idx} fontSize="0.78rem" />
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {/* ── 2. Logistics & Highlights Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Date & Time */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: `${tokens.primary}18`,
              border: `1px solid ${tokens.primary}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.primary,
              flexShrink: 0,
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
              Date &amp; Schedule
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: tokens.textPrimary, mt: 0.3 }}>
              {formatDate(activity?.date)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: tokens.textMuted }} />
              <Typography variant="caption" sx={{ color: tokens.textSecondary }}>
                Starts at 6:30 PM (Cairo Time)
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Location & Venue */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: `${tokens.accent}18`,
              border: `1px solid ${tokens.accent}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.accent,
              flexShrink: 0,
            }}
          >
            <PlaceIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
              Venue &amp; Location
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: tokens.textPrimary, mt: 0.3 }}>
              {activity?.venue}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.textSecondary, display: 'block', mt: 0.5 }}>
              {activity?.city ? `${activity.city}, Egypt` : 'Egypt'}
            </Typography>
          </Box>
        </Paper>

        {/* Experience Level */}
        {activity?.level && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '18px',
              bgcolor: tokens.surface,
              border: `1px solid ${tokens.border}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: 'rgba(167, 139, 250, 0.15)',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c4b5fd',
                flexShrink: 0,
              }}
            >
              <SchoolIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
                Audience Level
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: tokens.textPrimary, mt: 0.3 }}>
                {activity.level}
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.textSecondary, display: 'block', mt: 0.5 }}>
                Recommended technical prerequisites
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Track Category */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '18px',
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: `${tokens.teal}18`,
              border: `1px solid ${tokens.teal}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.teal,
              flexShrink: 0,
            }}
          >
            <LocalOfferIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: tokens.textMuted, fontWeight: 600, textTransform: 'uppercase' }}>
              Track &amp; Domain
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 700, color: tokens.textPrimary, mt: 0.3 }}>
              {activity?.category}
            </Typography>
            <Typography variant="caption" sx={{ color: tokens.textSecondary, display: 'block', mt: 0.5 }}>
              Curated Egyptian developer track
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
