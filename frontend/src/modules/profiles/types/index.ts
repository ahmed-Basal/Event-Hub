export interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string | null;
  image?: string | null;
  following: boolean;
  followersCount: number;
  followingCount: number;
  photos: Photo[];
}

export interface UserActivity {
  id: string;
  title: string;
  category: string;
  date: string;
  image?: string | null;
}
