import type { LocationIQAutocompleteParams, LocationIQResult } from '../types/location';

const LOCATIONIQ_API_KEY =
  (import.meta.env.VITE_LOCATIONIQ_API_KEY as string | undefined) ||
  'pk.9ee8cd456c9ddcee4ec9f897552787cc';

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
};

export default locationIqApi;
