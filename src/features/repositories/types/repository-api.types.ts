/**
 * Repository API model interface
 */
export interface RepositoryApiModel {
  id: string;
  name: string;
  description?: string | null;
  url: string;
  owner: {
    login: string;
    avatarUrl?: string;
  };
  isPrivate: boolean;
  visibility?: string;
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
  isTemplate?: boolean;
  collaborators?: {
    edges: Array<{
      permission: string;
      node: {
        id: string;
        login: string;
        name?: string | null;
        avatarUrl: string;
      };
    }>;
  };
}

/**
 * Repository create input interface
 */
export interface CreateRepositoryInput {
  name: string;
  description?: string;
  visibility: "PRIVATE" | "PUBLIC" | "INTERNAL";
  template?: boolean;
}

/**
 * Viewer response interface for repository queries
 */
export interface ViewerResponse {
  viewer?: {
    repositories?: {
      nodes?: Array<unknown> | null;
    } | null;
  } | null;
}

/**
 * Create repository response interface
 */
export interface CreateRepositoryResponse {
  createRepository?: {
    repository?: unknown;
  } | null;
}
