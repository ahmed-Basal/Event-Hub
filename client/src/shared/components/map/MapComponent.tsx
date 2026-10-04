import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme';

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const customMarkerIcon = L.divIcon({
  className: 'custom-event-marker',
  html: `
    <div style="position: relative; width: 36px; height: 36px;">
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.25);
        animation: marker-pulse 2s infinite ease-out;
      "></div>
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), 0 0 12px rgba(245, 158, 11, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #0f172a;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export interface MapComponentProps {
  position?: [number, number];
  latitude?: number;
  longitude?: number;
  venue?: string;
  city?: string;
  zoom?: number;
  height?: number | string;
  width?: number | string;
  interactive?: boolean;
  showMarker?: boolean;
  markerTitle?: string;
  markerSubtitle?: string;
  tileTheme?: 'dark' | 'standard' | 'voyager';
  borderRadius?: string | number;
  sx?: SxProps<Theme>;
  className?: string;
}

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
  voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

const DEFAULT_CAIRO: [number, number] = [30.0444, 31.2357];

export default function MapComponent({
  position,
  latitude,
  longitude,
  venue,
  city,
  zoom = 14,
  height = 320,
  width = '100%',
  interactive = true,
  showMarker = true,
  markerTitle,
  markerSubtitle,
  tileTheme = 'dark',
  borderRadius = '16px',
  sx,
  className,
}: MapComponentProps) {
  const centerPosition = useMemo<[number, number]>(() => {
    if (position && !isNaN(position[0]) && !isNaN(position[1])) {
      return position;
    }
    if (
      typeof latitude === 'number' &&
      !isNaN(latitude) &&
      typeof longitude === 'number' &&
      !isNaN(longitude) &&
      (latitude !== 0 || longitude !== 0)
    ) {
      return [latitude, longitude];
    }
    return DEFAULT_CAIRO;
  }, [position, latitude, longitude]);

  const tileUrl = TILE_URLS[tileTheme] || TILE_URLS.dark;
  const title = markerTitle || venue || 'Event Location';
  const subtitle = markerSubtitle || city;

  return (
    <Box
      className={className}
      sx={{
        width,
        height,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.shadowCard,
        bgcolor: tokens.surface,
        '& .leaflet-container': {
          width: '100%',
          height: '100%',
          fontFamily: 'inherit',
          bgcolor: '#111827',
          zIndex: 1,
        },
        '& .leaflet-popup-content-wrapper': {
          bgcolor: tokens.surface,
          color: tokens.textPrimary,
          border: `1px solid ${tokens.border}`,
          borderRadius: '12px',
          boxShadow: tokens.shadowDropdown,
          p: 0,
        },
        '& .leaflet-popup-content': {
          m: '12px 16px',
          lineHeight: 1.4,
        },
        '& .leaflet-popup-tip': {
          bgcolor: tokens.surface,
          border: `1px solid ${tokens.border}`,
        },
        '& .leaflet-popup-close-button': {
          color: `${tokens.textMuted} !important`,
          top: '8px !important',
          right: '8px !important',
          '&:hover': {
            color: `${tokens.primary} !important`,
          },
        },
        '@keyframes marker-pulse': {
          '0%': { transform: 'scale(0.8)', opacity: 0.8 },
          '100%': { transform: 'scale(1.8)', opacity: 0 },
        },
        ...sx,
      }}
    >
      <MapContainer
        center={centerPosition}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <ChangeView center={centerPosition} zoom={zoom} />
        <TileLayer
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />

        {showMarker && (
          <Marker position={centerPosition} icon={customMarkerIcon}>
            <Popup>
              <Box sx={{ minWidth: 160 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: tokens.textPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  📍 {title}
                </Typography>
                {subtitle && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: tokens.textSecondary,
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    {subtitle}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: tokens.textMuted,
                    fontSize: '0.7rem',
                    display: 'block',
                    mt: 0.5,
                  }}
                >
                  {centerPosition[0].toFixed(4)}, {centerPosition[1].toFixed(4)}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  );
}
