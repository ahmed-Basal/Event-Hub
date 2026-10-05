import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapResizerProps {
  center: [number, number];
  zoom: number;
}

export default function MapResizer({ center, zoom }: MapResizerProps) {
  const map = useMap();

  useEffect(() => {
    // Invalidate size immediately and after animations (e.g. MUI Collapse/Dialog)
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
