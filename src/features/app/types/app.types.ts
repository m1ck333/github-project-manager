/**
 * App initialization state
 */
export interface AppInitState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * App services interface
 */
export interface AppServices {
  init: {
    initialize: (forceRefresh?: boolean) => Promise<unknown>;
    reset: () => void;
  };
}

/**
 * GitHub viewer data from API
 */
export interface GitHubViewerData {
  login: string;
  name?: string | null;
  avatarUrl: string;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  twitterUsername?: string | null;
  repositories?: {
    nodes: unknown[];
  };
  projectsV2?: {
    nodes: unknown[];
  };
}

/**
 * GitHub project data from API
 */
export interface GitHubProjectNode {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  number: number;
  url: string;
  [key: string]: unknown;
}

import { GitHubResponse } from "@/api-github";

// Re-export the GitHubResponse type for use in this feature
export type { GitHubResponse };
