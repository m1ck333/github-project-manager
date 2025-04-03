// Export API operations
export * from "./mutations";
export * from "./queries";

// Export repository API interfaces
export interface RepositoryOwner {
  login: string;
  avatarUrl: string;
}

export interface RepositoryApiModel {
  id: string;
  name: string;
  owner: RepositoryOwner;
  description?: string | null;
  url: string;
  createdAt: string;
  isTemplate: boolean;
  visibility: string;
  collaborators?: {
    edges?: Array<{
      node: {
        id: string;
        login: string;
        avatarUrl: string;
      };
      permission?: string;
    } | null> | null;
  } | null;
}

// Repository creation input
export interface CreateRepositoryInput {
  name: string;
  description?: string;
  visibility: string;
}

// Export enums
import { RepositoryVisibility } from "@/api/generated/graphql";
export { RepositoryVisibility };
