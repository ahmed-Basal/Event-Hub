import type { SxProps, Theme } from '@mui/material/styles';

export type TileThemeType = 'voyager' | 'standard' | 'dark';

export interface TileConfigItem {
  label: string;
  url: string;
  attribution: string;
}

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
