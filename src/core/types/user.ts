/**
 * User represents a GitHub user account
 */
export interface User {
  id: string;
  login: string;
  name?: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  company?: string;
  email?: string;
  websiteUrl?: string;
  twitterUsername?: string;
  isViewer?: boolean;
}

/**
 * Authentication state including the current user and token
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: Error | null;
}

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
