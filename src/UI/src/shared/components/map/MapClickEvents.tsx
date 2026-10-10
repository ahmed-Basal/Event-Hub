import { useMapEvents } from 'react-leaflet';

interface MapClickEventsProps {
  onLocationSelect?: (coords: [number, number]) => void;
  editable?: boolean;
}

export default function MapClickEvents({ onLocationSelect, editable }: MapClickEventsProps) {
  useMapEvents({
    click(e) {
      if (editable && onLocationSelect) {
        onLocationSelect([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return null;
}
