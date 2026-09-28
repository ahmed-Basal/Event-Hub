import { Box, Paper, Typography } from '@mui/material';
import {
  CalendarMonth,
  Place,
  School,
  LocalOffer,
  Article,
  AccessTime,
} from '@mui/icons-material';
import {
  formatDate,
  TagList,
  LogisticsCard,
  tokens,
  type Activity,
} from '../../../lib';

interface Props {
  activity: Activity;
}

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
            <Article sx={{ fontSize: 20 }} />
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
              <LocalOffer sx={{ fontSize: 16, color: tokens.primary }} />
              <Typography
                variant="caption"
                sx={{ color: tokens.textMuted, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                Key Technologies &amp; Topics
              </Typography>
            </Box>
            <TagList tags={activity.tags} size="medium" gap={1} />
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
        <LogisticsCard
          icon={<CalendarMonth sx={{ fontSize: 24 }} />}
          color={tokens.primary}
          label="Date & Schedule"
          value={formatDate(activity?.date)}
          subtitle={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTime sx={{ fontSize: 14, color: tokens.textMuted }} />
              <Typography variant="caption" sx={{ color: tokens.textSecondary }}>
                Starts at 6:30 PM (Cairo Time)
              </Typography>
            </Box>
          }
        />

        <LogisticsCard
          icon={<Place sx={{ fontSize: 24 }} />}
          color={tokens.accent}
          label="Venue & Location"
          value={activity?.venue}
          subtitle={activity?.city ? `${activity.city}, Egypt` : 'Egypt'}
        />

        {activity?.level && (
          <LogisticsCard
            icon={<School sx={{ fontSize: 24 }} />}
            color="#c4b5fd"
            label="Audience Level"
            value={activity.level}
            subtitle="Recommended technical prerequisites"
          />
        )}

        <LogisticsCard
          icon={<LocalOffer sx={{ fontSize: 24 }} />}
          color={tokens.teal}
          label="Track & Domain"
          value={activity?.category}
          subtitle="Curated Egyptian developer track"
        />
      </Box>
    </Box>
  );
}
