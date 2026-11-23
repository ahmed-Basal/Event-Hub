export interface Attendee {
  username: string;
  displayName: string;
  bio?: string | null;
  image?: string | null;
  isHost: boolean;
  following: boolean;
  followersCount: number;
  followingCount: number;
}

export interface Activity {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string;
  category: string;
  isCancelled: boolean;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  image: string;
  level?: string;
  price?: number;
  currency?: string;
  hotScore?: number;
  tags: string[];
  hostUsername?: string | null;
  hostDisplayName?: string | null;
  attendees: Attendee[];
}

export interface ActivityQueryParams {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  filter?: string;
  startDate?: string;
  search?: string;
  city?: string;
  pricing?: string;
  sortBy?: string;
}

export interface CreateActivityPayload {
  title: string;
  description: string;
  category: string;
  date: string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  image?: string;
  level?: string;
  price?: number;
  currency?: string;
  tags?: string[];
}

export const ACTIVITY_CATEGORIES = [
  { label: 'Backend', value: 'backend' },
  { label: 'Frontend', value: 'frontend' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Cybersecurity', value: 'cybersecurity' },
  { label: 'Data Analysis', value: 'dataanalysis' },
  { label: 'Drinks', value: 'drinks' },
  { label: 'Culture', value: 'culture' },
  { label: 'Film', value: 'film' },
  { label: 'Food', value: 'food' },
  { label: 'Music', value: 'music' },
  { label: 'Travel', value: 'travel' },
] as const;

export function getCategoryImage(category?: string, customImage?: string | null): string {
  if (customImage && (customImage.startsWith('http') || customImage.startsWith('/'))) {
    return customImage;
  }
  const normalized = (category || 'backend').toLowerCase().replace(/\s+/g, '');
  const known = [
    'backend', 'frontend', 'devops', 'cybersecurity', 'dataanalysis',
    'drinks', 'culture', 'film', 'food', 'music', 'travel',
  ];
  return known.includes(normalized)
    ? `/images/categoryImages/${normalized}.jpg`
    : '/images/categoryImages/backend.jpg';
}
