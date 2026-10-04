import { useState } from 'react';
import { Box, Paper, Typography, Button, Collapse } from '@mui/material';
import {
  CalendarMonth,
  Place,
  School,
  LocalOffer,
  Article,
  AccessTime,
  MapOutlined,
} from '@mui/icons-material';
import {
  formatDate,
  TagList,
  LogisticsCard,
  MapComponent,
  type Activity,
} from '../../../shared';
import { tokens } from '../../../theme';

interface Props {
  activity: Activity;
}

export default function ActivityDetailsInfo({ activity }: Props) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>

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
          subtitle={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: tokens.textSecondary }}>
                {activity?.city ? `${activity.city}, Egypt` : 'Egypt'}
              </Typography>
              <Button
                size="small"
                startIcon={<MapOutlined sx={{ fontSize: 16 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setMapOpen((prev) => !prev);
                }}
                sx={{
                  py: 0.2,
                  px: 1,
                  borderRadius: '6px',
                  bgcolor: mapOpen ? `${tokens.primary}25` : `${tokens.primary}15`,
                  color: tokens.primary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: `${tokens.primary}30`,
                  },
                }}
              >
                {mapOpen ? 'Hide Map' : 'Show Map'}
              </Button>
            </Box>
          }
          onClick={() => setMapOpen((prev) => !prev)}
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

      <Collapse in={mapOpen} timeout="auto" unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: '20px',
            bgcolor: tokens.surface,
            border: `1px solid ${tokens.border}`,
            boxShadow: tokens.shadowCard,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Place sx={{ fontSize: 20, color: tokens.primary }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: tokens.textPrimary }}>
                {activity?.venue} — {activity?.city}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setMapOpen(false)}
              sx={{
                color: tokens.textMuted,
                textTransform: 'none',
                fontSize: '0.8rem',
                '&:hover': { color: tokens.primary },
              }}
            >
              Close Map
            </Button>
          </Box>
          <MapComponent
            latitude={activity?.latitude}
            longitude={activity?.longitude}
            venue={activity?.venue}
            city={activity?.city}
            height={340}
            borderRadius="14px"
          />
        </Paper>
      </Collapse>
    </Box>
  );
}
