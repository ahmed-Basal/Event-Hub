import { Marker, Popup, Tooltip } from 'react-leaflet';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { tokens } from '../../../theme';
import { customMarkerIcon } from './map.constants';

interface MapMarkerProps {
  position: [number, number];
  title: string;
  subtitle?: string;
  editable?: boolean;
  googleMapsUrl: string;
  onLocationSelect?: (coords: [number, number]) => void;
}

export default function MapMarker({
  position,
  title,
  subtitle,
  editable,
  googleMapsUrl,
  onLocationSelect,
}: MapMarkerProps) {
  return (
    <Marker
      position={position}
      icon={customMarkerIcon}
      draggable={editable}
      eventHandlers={{
        dragend: (e) => {
          if (editable && onLocationSelect) {
            const latlng = e.target.getLatLng();
            onLocationSelect([latlng.lat, latlng.lng]);
          }
        },
      }}
    >
      {/* Permanent Tooltip so places are immediately visible without clicking */}
      <Tooltip permanent direction="top" offset={[0, -38]} opacity={0.98}>
        📍 {title}
      </Tooltip>

      <Popup>
        <Box sx={{ minWidth: 170, p: 0.5 }}>
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
                mt: 0.3,
                fontWeight: 500,
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
              fontFamily: 'monospace',
            }}
          >
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </Typography>
          <Button
            size="small"
            fullWidth
            component="a"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
            sx={{
              mt: 1,
              textTransform: 'none',
              fontSize: '0.72rem',
              py: 0.3,
              bgcolor: `${tokens.primary}20`,
              color: tokens.primary,
              fontWeight: 600,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: `${tokens.primary}35`,
              },
            }}
          >
            Open in Google Maps
          </Button>
        </Box>
      </Popup>
    </Marker>
  );
}
