/**
 * User profile interface
 */
export interface UserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  email: string | null;
  websiteUrl: string | null;
  twitterUsername: string | null;
}
