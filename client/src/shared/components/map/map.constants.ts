import L from 'leaflet';
import config from '../../../config';
import type { TileThemeType, TileConfigItem } from './map.types';

export const DEFAULT_CAIRO: [number, number] = [30.0444, 31.2357];

// Custom Leaflet amber marker icon with pulse animation
export const customMarkerIcon = L.divIcon({
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

export const getTileConfig = (
  apiKey = config.keys.locationIqApiKey
): Record<TileThemeType, TileConfigItem> => ({
  voyager: {
    label: 'Detailed Streets (LocationIQ)',
    url: `https://tiles.locationiq.com/v3/streets/r/{z}/{x}/{y}.png?key=${apiKey}`,
    attribution:
      '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    label: 'Dark Mode (LocationIQ)',
    url: `https://tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${apiKey}`,
    attribution:
      '&copy; <a href="https://locationiq.com/?ref=maps">LocationIQ</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  standard: {
    label: 'OpenStreetMap (Public)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
});
