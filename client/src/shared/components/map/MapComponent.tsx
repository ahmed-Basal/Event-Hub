import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Box from '@mui/material/Box';
import type { MapComponentProps } from './map.types';
import { getMapContainerStyles } from './map.styles';
import { useMapState } from './useMapState';
import MapResizer from './MapResizer';
import MapClickEvents from './MapClickEvents';
import MapSearchBar from './MapSearchBar';
import MapControls from './MapControls';
import MapMarker from './MapMarker';
import MapHintBadge from './MapHintBadge';

export type { MapComponentProps, TileThemeType } from './map.types';

export default function MapComponent(props: MapComponentProps) {
  const {
    zoom = 14,
    height = 320,
    width = '100%',
    interactive = true,
    showMarker = true,
    borderRadius = '16px',
    editable = false,
    showSearch = false,
    showTileSwitcher = true,
    showDirectionsLink = true,
    onLocationSelect,
    sx,
    className,
  } = props;

  const {
    activeTheme,
    setActiveTheme,
    centerPosition,
    title,
    subtitle,
    tileConfig,
    currentTileConfig,
    googleMapsUrl,
  } = useMapState(props);

  return (
    <Box
      className={className}
      sx={getMapContainerStyles(width, height, borderRadius, sx)}
    >
      {/* Floating Place Search Bar */}
      {(editable || showSearch) && (
        <MapSearchBar onLocationSelect={onLocationSelect} />
      )}

      {/* Layer Switcher & External Link Controls */}
      <MapControls
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
        tileConfig={tileConfig}
        googleMapsUrl={googleMapsUrl}
        showTileSwitcher={showTileSwitcher}
        showDirectionsLink={showDirectionsLink}
      />

      {/* Editable Mode Hint Badge */}
      {editable && <MapHintBadge />}

      {/* Leaflet Map Canvas */}
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
          <MapMarker
            position={centerPosition}
            title={title}
            subtitle={subtitle}
            editable={editable}
            googleMapsUrl={googleMapsUrl}
            onLocationSelect={onLocationSelect}
          />
        )}
      </MapContainer>
    </Box>
  );
}
