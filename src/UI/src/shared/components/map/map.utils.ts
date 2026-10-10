import { DEFAULT_CAIRO } from './map.constants';

/**
 * Safely parses and validates geographic coordinates from arrays, numbers, or strings.
 * Enforces valid latitude [-90, 90] and longitude [-180, 180] bounds.
 */
export function resolveCoordinates(
  position?: [number, number],
  latitude?: number | string,
  longitude?: number | string
): [number, number] {
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
}

/**
 * Generates an external Google Maps search URL from coordinates.
 */
export function buildGoogleMapsUrl(coords: [number, number]): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`;
}
