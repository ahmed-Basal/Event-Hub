export type Category =
  | 'BackEnd'
  | 'CyberSecurity'
  | 'FrontEnd'
  | 'DataAnalysis'
  | 'DevOps';

export type ActivityLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'All Levels';

export interface Activity {
  id: string;
  title: string;
  slug: string;
  date: string;
  description: string;
  category: Category | string;
  city: string;
  venue: string;
  latitude: number;
  longitude: number;
  image?: string;
  isCancelled: boolean;
  level?: ActivityLevel | string;
  tags?: string[];
}

export type CreateActivityDto = Omit<Activity, 'id' | 'slug'> & {
  id?: string;
};

export type UpdateActivityDto = Partial<Activity> & {
  id: string;
};

export interface ActivityFilterParams {
  category?: string;
  status?: 'all' | 'going' | 'hosting';
  date?: string | Date;
  city?: string;
  searchTerm?: string;
  tag?: string;
}
