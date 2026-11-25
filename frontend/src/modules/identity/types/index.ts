export interface User {
  id: string;
  displayName: string;
  username: string;
  image?: string | null;
  token?: string;
  refreshToken?: string;
  roles?: string[];
}
