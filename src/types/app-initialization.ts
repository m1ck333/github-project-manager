import { Repository, Project } from ".";

/**
 * User profile information
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

/**
 * Comprehensive type representing all data needed for the application
 */
export interface AllAppData {
  user: UserProfile;
  repositories: Repository[];
  projects: Project[];
}
