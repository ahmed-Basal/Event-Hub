export interface LocationIQAddress {
  name?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  state_district?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  [key: string]: string | undefined;
}

export interface LocationIQResult {
  place_id: string;
  osm_id?: string;
  osm_type?: string;
  licence?: string;
  lat: string;
  lon: string;
  boundingbox?: string[];
  class?: string;
  type?: string;
  display_name: string;
  display_place: string;
  display_address: string;
  address?: LocationIQAddress;
}

export interface LocationIQAutocompleteParams {
  query: string;
  limit?: number;
  countrycodes?: string;
  normalizecity?: 1 | 0;
  acceptLanguage?: string;
  tag?: string;
  signal?: AbortSignal;
}
