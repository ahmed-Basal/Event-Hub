'use client';

import Link from 'next/link';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';
import type { Activity } from '@features/Activities/Frontend';
import { tokens } from '@/theme/tokens';

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ActivitiesMapView({ activities }: { activities: Activity[] }) {
  const withCoords = activities.filter((a) => a.latitude !== 0 || a.longitude !== 0);
  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].latitude, withCoords[0].longitude]
      : [30.0444, 31.2357];

  return (
    <Paper
      sx={{
        height: 560,
        borderRadius: '18px',
        overflow: 'hidden',
        border: `1px solid ${tokens.border}`,
      }}
    >
      <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((act) => (
          <Marker key={act.id} position={[act.latitude, act.longitude]} icon={markerIcon}>
            <Popup>
              <Box sx={{ minWidth: 210, p: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Chip
                    label={act.category}
                    size="small"
                    sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#0EA5E9', color: '#fff' }}
                  />
                  <Typography variant="caption" fontWeight={700} color="#0284C7">
                    {act.price && act.price > 0 ? `$${act.price}` : 'Free'}
                  </Typography>
                </Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: '#0A0E1A' }}>
                  {act.title}
                </Typography>
                <Typography variant="caption" display="block" sx={{ color: '#475569', mb: 1 }}>
                  {act.venue}, {act.city} • {format(new Date(act.date), 'dd MMM')}
                </Typography>
                <Button
                  component={Link}
                  href={`/activities/${act.id}`}
                  variant="contained"
                  size="small"
                  fullWidth
                  sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                >
                  View Event
                </Button>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Paper>
  );
}
