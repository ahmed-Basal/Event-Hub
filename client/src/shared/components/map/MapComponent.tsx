import { useEffect, useMemo, useState, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LayersIcon from '@mui/icons-material/Layers';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PlaceIcon from '@mui/icons-material/Place';
import CheckIcon from '@mui/icons-material/Check';
import type { SxProps, Theme } from '@mui/material/styles';
import { tokens } from '../../../theme';
import { locationIqApi, LOCATIONIQ_API_KEY } from '../../api';
import type { LocationIQResult } from '../../types';

// Leaflet custom marker icon
const customMarkerIcon = L.divIcon({
  className: 'custom-event-marker',
  html: `
    <div style="position: relative; width: 38px; height: 38px; transform: translate(-3px, -3px);">
      <div style="
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        background: rgba(245, 158, 11, 0.35);
        animation: marker-pulse 2s infinite ease-out;
      "></div>
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        border: 2.5px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 16px rgba(245, 158, 11, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: #0f172a;
          border-radius: 50%;
          transform: rotate(45deg);
          box-shadow: inset 0 0 2px rgba(255, 255, 255, 0.3);
        "></div>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export type TileThemeType = 'voyager' | 'standard' | 'dark';

export interface MapComponentProps {
  position?: [number, number];
  latitude?: number | string;
  longitude?: number | string;
  venue?: string;
  city?: string;
  zoom?: number;
  height?: number | string;
  width?: number | string;
  interactive?: boolean;
  showMarker?: boolean;
  markerTitle?: string;
  markerSubtitle?: string;
  tileTheme?: TileThemeType;
  borderRadius?: string | number;
  editable?: boolean;
  showSearch?: boolean;
  showTileSwitcher?: boolean;
  showDirectionsLink?: boolean;
  onLocationSelect?: (coords: [number, number], placeInfo?: { venue?: string; city?: string }) => void;
  sx?: SxProps<Theme>;
  className?: string;
}

const TILE_CONFIG: Record<
  TileThemeType,
  { label: string; url: string; attribution: string }
> = {
  voyager: {
    label: 'Detailed Streets (LocationIQ)',
    url: `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`,
    attribution:
      '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    label: 'Dark Mode (LocationIQ)',
    url: `https://tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${LOCATIONIQ_API_KEY}`,
    attribution:
      '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  standard: {
    label: 'OpenStreetMap (Public)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
};

const DEFAULT_CAIRO: [number, number] = [30.0444, 31.2357];

function MapResizer({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately and after animations (e.g. MUI Collapse)
    map.invalidateSize();
    const timers = [
      setTimeout(() => map.invalidateSize(), 50),
      setTimeout(() => map.invalidateSize(), 150),
      setTimeout(() => map.invalidateSize(), 300),
      setTimeout(() => map.invalidateSize(), 550),
    ];

    const container = map.getContainer();
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        map.invalidateSize();
      });
      observer.observe(container);
    }

    return () => {
      timers.forEach(clearTimeout);
      observer?.disconnect();
    };
  }, [map]);

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

function MapClickEvents({
  onLocationSelect,
  editable,
}: {
  onLocationSelect?: (coords: [number, number]) => void;
  editable?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (editable && onLocationSelect) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

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
  tileTheme = 'voyager',
  borderRadius = '16px',
  editable = false,
  showSearch = false,
  showTileSwitcher = true,
  showDirectionsLink = true,
  onLocationSelect,
  sx,
  className,
}: MapComponentProps) {
  const [activeTheme, setActiveTheme] = useState<TileThemeType>(tileTheme);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationIQResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse coordinates safely (handles numbers and strings)
  const centerPosition = useMemo<[number, number]>(() => {
    if (
      position &&
      Array.isArray(position) &&
      !isNaN(Number(position[0])) &&
      !isNaN(Number(position[1]))
    ) {
      return [Number(position[0]), Number(position[1])];
    }

    const latNum = Number(latitude);
    const lonNum = Number(longitude);

    if (
      !isNaN(latNum) &&
      !isNaN(lonNum) &&
      (latNum !== 0 || lonNum !== 0) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lonNum >= -180 &&
      lonNum <= 180
    ) {
      return [latNum, lonNum];
    }

    return DEFAULT_CAIRO;
  }, [position, latitude, longitude]);

  const title = markerTitle || venue || 'Event Location';
  const subtitle = markerSubtitle || city;
  const currentTileConfig = TILE_CONFIG[activeTheme] || TILE_CONFIG.voyager;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${centerPosition[0]},${centerPosition[1]}`;

  // Handle Search Input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!val || val.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await locationIqApi.autocomplete({
          query: val,
          limit: 6,
          countrycodes: 'eg',
          acceptLanguage: 'ar,en',
        });
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectSearchResult = (result: LocationIQResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      const selectedVenue =
        result.display_place ||
        result.address?.name ||
        result.display_name.split(',')[0] ||
        '';
      const selectedCity =
        result.address?.city ||
        result.address?.town ||
        result.address?.state ||
        '';

      onLocationSelect?.([lat, lon], {
        venue: selectedVenue,
        city: selectedCity,
      });
      setShowDropdown(false);
      setSearchQuery(selectedVenue);
    }
  };

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
          bgcolor: '#1e293b',
          zIndex: 1,
        },
        '& .custom-event-marker': {
          background: 'transparent !important',
          border: 'none !important',
        },
        '& .leaflet-tooltip': {
          bgcolor: `${tokens.surface} !important`,
          color: `${tokens.textPrimary} !important`,
          border: `1px solid ${tokens.border} !important`,
          borderRadius: '10px !important',
          boxShadow: `${tokens.shadowDropdown} !important`,
          fontWeight: 700,
          fontSize: '0.8rem !important',
          px: 1.5,
          py: 0.6,
          whiteSpace: 'nowrap',
          '&:before': {
            borderTopColor: `${tokens.border} !important`,
          },
        },
        '& .leaflet-popup-content-wrapper': {
          bgcolor: tokens.surface,
          color: tokens.textPrimary,
          border: `1px solid ${tokens.border}`,
          borderRadius: '14px',
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
          '100%': { transform: 'scale(1.9)', opacity: 0 },
        },
        ...sx,
      }}
    >
      {/* Floating Place Search Bar (for edit mode or when search is enabled) */}
      {(editable || showSearch) && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 64,
            maxWidth: 380,
            zIndex: 1000,
          }}
        >
          <Paper
            elevation={4}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.6,
              borderRadius: '12px',
              bgcolor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${tokens.border}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <SearchIcon sx={{ color: tokens.primary, fontSize: 20, mr: 1 }} />
            <InputBase
              fullWidth
              placeholder="Search place, venue, or address in Egypt..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              sx={{
                color: tokens.textPrimary,
                fontSize: '0.85rem',
                '& input::placeholder': {
                  color: tokens.textMuted,
                  opacity: 1,
                },
              }}
            />
            {isSearching && (
              <CircularProgress size={16} sx={{ color: tokens.primary, mr: 0.5 }} />
            )}
            {searchQuery && (
              <IconButton
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowDropdown(false);
                }}
                sx={{ p: 0.5, color: tokens.textMuted }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Paper>

          {/* Autocomplete Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <Paper
              elevation={6}
              sx={{
                mt: 1,
                borderRadius: '12px',
                bgcolor: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(16px)',
                border: `1px solid ${tokens.border}`,
                boxShadow: tokens.shadowDropdown,
                maxHeight: 220,
                overflowY: 'auto',
                p: 0.5,
              }}
            >
              {searchResults.map((result) => {
                const mainName =
                  result.display_place ||
                  result.address?.name ||
                  result.display_name.split(',')[0];
                const subName =
                  result.display_address ||
                  [result.address?.city, result.address?.state, result.address?.country]
                    .filter(Boolean)
                    .join(', ');

                return (
                  <Box
                    key={result.place_id}
                    onClick={() => handleSelectSearchResult(result)}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.2,
                      px: 1.5,
                      py: 1,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        bgcolor: `${tokens.primary}25`,
                      },
                    }}
                  >
                    <PlaceIcon sx={{ fontSize: 18, color: tokens.primary, mt: 0.2 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: tokens.textPrimary,
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {mainName}
                      </Typography>
                      {subName && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: tokens.textMuted,
                            fontSize: '0.72rem',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {subName}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Paper>
          )}
        </Box>
      )}

      {/* Layer Switcher & External Link Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
        }}
      >
        {showTileSwitcher && (
          <>
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              title="Change Map Style"
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(8px)',
                color: tokens.textPrimary,
                border: `1px solid ${tokens.border}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                '&:hover': {
                  bgcolor: 'rgba(30, 41, 59, 0.95)',
                  color: tokens.primary,
                },
              }}
            >
              <LayersIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              slotProps={{
                paper: {
                  sx: {
                    bgcolor: tokens.surface,
                    border: `1px solid ${tokens.border}`,
                    borderRadius: '12px',
                    boxShadow: tokens.shadowDropdown,
                    minWidth: 190,
                  },
                },
              }}
            >
              {(Object.keys(TILE_CONFIG) as TileThemeType[]).map((themeKey) => (
                <MenuItem
                  key={themeKey}
                  selected={activeTheme === themeKey}
                  onClick={() => {
                    setActiveTheme(themeKey);
                    setMenuAnchor(null);
                  }}
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: activeTheme === themeKey ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  {TILE_CONFIG[themeKey].label}
                  {activeTheme === themeKey && (
                    <CheckIcon sx={{ fontSize: 16, color: tokens.primary }} />
                  )}
                </MenuItem>
              ))}
            </Menu>
          </>
        )}

        {showDirectionsLink && (
          <IconButton
            size="small"
            component="a"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Google Maps"
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&:hover': {
                bgcolor: 'rgba(30, 41, 59, 0.95)',
                color: tokens.primary,
              },
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>

      {/* Editable Mode Hint Badge */}
      {editable && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <Chip
            size="small"
            label="📍 Click on the map or drag the pin to set exact location"
            sx={{
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              color: tokens.primary,
              fontWeight: 600,
              fontSize: '0.72rem',
              border: `1px solid ${tokens.border}`,
              boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
            }}
          />
        </Box>
      )}

      {/* Leaflet Map */}
      <MapContainer
        center={centerPosition}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <MapResizer center={centerPosition} zoom={zoom} />
        <MapClickEvents onLocationSelect={onLocationSelect} editable={editable} />

        <TileLayer
          url={currentTileConfig.url}
          attribution={currentTileConfig.attribution}
        />

        {showMarker && (
          <Marker
            position={centerPosition}
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
            <Tooltip
              permanent
              direction="top"
              offset={[0, -38]}
              opacity={0.98}
            >
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
                  {centerPosition[0].toFixed(5)}, {centerPosition[1].toFixed(5)}
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
        )}
      </MapContainer>
    </Box>
  );
}
