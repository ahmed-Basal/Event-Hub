import { Box, Paper, Typography, Button } from '@mui/material';
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
  MapComponent,
  type Activity,
} from '../../../../shared';
import LogisticsCard from './LogisticsCard';
import { tokens } from '../../../../theme';

interface Props {
  activity: Activity;
}

export default function ActivityDetailsInfo({ activity }: Props) {
  const latNum = Number(activity?.latitude) || 30.0444;
  const lonNum = Number(activity?.longitude) || 31.2357;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latNum},${lonNum}`;

  const scrollToMap = () => {
    document.getElementById('event-location-map')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>

      {/* Meetup Description Card */}
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

      {/* Logistics Overview Grid */}
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
          value={activity?.venue || 'Location TBA'}
          subtitle={
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
              <Typography variant="caption" sx={{ color: tokens.textSecondary }}>
                {activity?.city ? `${activity.city}, Egypt` : 'Egypt'}
              </Typography>
              <Button
                size="small"
                startIcon={<MapOutlined sx={{ fontSize: 14 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToMap();
                }}
                sx={{
                  py: 0.2,
                  px: 1,
                  borderRadius: '6px',
                  bgcolor: `${tokens.primary}15`,
                  color: tokens.primary,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: `${tokens.primary}25`,
                  },
                }}
              >
                View on Map ↓
              </Button>
            </Box>
          }
          onClick={scrollToMap}
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

      {/* Dedicated Interactive Event Map Card */}
      <Paper
        id="event-location-map"
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: '20px',
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
          boxShadow: tokens.shadowCard,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: `${tokens.accent}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.accent,
              }}
            >
              <Place sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: tokens.textPrimary, lineHeight: 1.2 }}>
                Event Location &amp; Venue
              </Typography>
              <Typography variant="caption" sx={{ color: tokens.textSecondary, fontWeight: 500 }}>
                {activity?.venue ? `${activity.venue} — ${activity?.city || 'Egypt'}` : `${activity?.city || 'Egypt'}`}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                display: { xs: 'none', sm: 'inline-block' },
                bgcolor: `${tokens.primary}15`,
                color: tokens.primary,
                border: `1px solid ${tokens.border}`,
                borderRadius: '8px',
                px: 1.2,
                py: 0.4,
                fontFamily: 'monospace',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            >
              📍 {latNum.toFixed(4)}, {lonNum.toFixed(4)}
            </Typography>

            <Button
              size="small"
              component="a"
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: tokens.primary,
                bgcolor: `${tokens.primary}15`,
                border: `1px solid ${tokens.border}`,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                px: 1.5,
                py: 0.5,
                '&:hover': {
                  bgcolor: `${tokens.primary}25`,
                },
              }}
            >
              Open in Google Maps ↗
            </Button>
          </Box>
        </Box>

        <MapComponent
          latitude={latNum}
          longitude={lonNum}
          venue={activity?.venue}
          city={activity?.city}
          height={380}
          zoom={15}
          interactive={true}
          showMarker={true}
          showTileSwitcher={true}
          showDirectionsLink={true}
          tileTheme="voyager"
          borderRadius="14px"
        />
      </Paper>
    </Box>
  );
}
