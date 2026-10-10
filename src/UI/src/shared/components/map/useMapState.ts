import { useMemo, useState } from 'react';
import config from '../../../config';
import type { MapComponentProps, TileThemeType } from './map.types';
import { getTileConfig } from './map.constants';
import { resolveCoordinates, buildGoogleMapsUrl } from './map.utils';

export function useMapState({
  position,
  latitude,
  longitude,
  venue,
  city,
  markerTitle,
  markerSubtitle,
  tileTheme = 'voyager',
}: Pick<
  MapComponentProps,
  | 'position'
  | 'latitude'
  | 'longitude'
  | 'venue'
  | 'city'
  | 'markerTitle'
  | 'markerSubtitle'
  | 'tileTheme'
>) {
  const [activeTheme, setActiveTheme] = useState<TileThemeType>(tileTheme);

  const centerPosition = useMemo(
    () => resolveCoordinates(position, latitude, longitude),
    [position, latitude, longitude]
  );

  const title = markerTitle || venue || 'Event Location';
  const subtitle = markerSubtitle || city;

  const tileConfig = useMemo(
    () => getTileConfig(config.keys.locationIqApiKey),
    []
  );

  const currentTileConfig = tileConfig[activeTheme] || tileConfig.voyager;
  const googleMapsUrl = useMemo(
    () => buildGoogleMapsUrl(centerPosition),
    [centerPosition]
  );

  return {
    activeTheme,
    setActiveTheme,
    centerPosition,
    title,
    subtitle,
    tileConfig,
    currentTileConfig,
    googleMapsUrl,
  };
}
