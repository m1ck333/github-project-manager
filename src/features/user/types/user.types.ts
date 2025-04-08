export interface User {
  id: string;
  login: string;
  avatarUrl: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  email: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
}
