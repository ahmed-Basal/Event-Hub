export interface ChatComment {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  username: string;
  displayName: string;
  image?: string | null;
}
