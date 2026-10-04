import type { LocationIQAutocompleteParams, LocationIQResult } from '../types/location';

export const LOCATIONIQ_API_KEY =
  (import.meta.env.VITE_LOCATIONIQ_API_KEY as string | undefined) ||
  'pk.45e9ac96fc4487ad1f59f38cc6e357e2';

const AUTOCOMPLETE_ENDPOINT = 'https://api.locationiq.com/v1/autocomplete';

export const locationIqApi = {
  async autocomplete({
    query,
    limit = 8,
    countrycodes,
    normalizecity = 1,
    acceptLanguage = 'ar,en',
    tag,
    signal,
  }: LocationIQAutocompleteParams): Promise<LocationIQResult[]> {
    const trimmed = query?.trim();
    if (!trimmed || trimmed.length < 3) return [];

    const params = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      q: trimmed,
      limit: String(limit),
      dedupe: '1',
      format: 'json',
      normalizecity: String(normalizecity),
    });

    if (acceptLanguage) {
      params.append('accept-language', acceptLanguage);
    }

    if (countrycodes) {
      params.append('countrycodes', countrycodes.toLowerCase());
    }

    if (tag) {
      params.append('tag', tag);
    }

    try {
      const response = await fetch(`${AUTOCOMPLETE_ENDPOINT}?${params.toString()}`, { signal });
      if (!response.ok) return [];

      const data: unknown = await response.json();
      return Array.isArray(data) ? (data as LocationIQResult[]) : [];
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return [];
      }
      return [];
    }
  },

  async reverse({
    lat,
    lon,
    acceptLanguage = 'ar,en',
    signal,
  }: {
    lat: number;
    lon: number;
    acceptLanguage?: string;
    signal?: AbortSignal;
  }): Promise<LocationIQResult | null> {
    const params = new URLSearchParams({
      key: LOCATIONIQ_API_KEY,
      lat: String(lat),
      lon: String(lon),
      format: 'json',
      'accept-language': acceptLanguage,
    });

    try {
      const response = await fetch(`https://us1.locationiq.com/v1/reverse?${params.toString()}`, { signal });
      if (!response.ok) return null;
      return (await response.json()) as LocationIQResult;
    } catch {
      return null;
    }
  },
};

export default locationIqApi;
