export interface User {
  id: string;
  username: string;
  displayName: string;
  email: string;
  token?: string;
  image?: string;
  bio?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  image?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface Attendee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isHost?: boolean;
  isFollowing?: boolean;
  badgeColor?: string;
  username?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  body: string;
  isSpeaker?: boolean;
  createdAt?: string;
}

export type ActivityComment = Comment;
