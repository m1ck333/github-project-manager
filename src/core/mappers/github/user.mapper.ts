import { UserProfile } from "../../types/user";

export interface GithubViewerData {
  id?: string;
  login: string;
  name?: string | null;
  avatarUrl: string;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
}

/**
 * Maps GitHub viewer data to our application's UserProfile model
 */
export function mapToUserProfile(userData: GithubViewerData): UserProfile {
  return {
    login: userData.login,
    name: userData.name || null,
    avatarUrl: userData.avatarUrl,
    bio: userData.bio || null,
    location: userData.location || null,
    company: userData.company || null,
    email: userData.email || null,
    websiteUrl: userData.websiteUrl || null,
    twitterUsername: userData.twitterUsername || null,
  };
}
