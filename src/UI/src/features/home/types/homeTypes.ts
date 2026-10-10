import type { Activity } from '../../../shared';

export interface HomeStats {
  activeDevelopers: number;
  totalEvents: number;
  techTracks: number;
}

export interface HomePageData {
  featuredActivity: Activity | null;
  upcomingActivities: Activity[];
  stats: HomeStats;
}
