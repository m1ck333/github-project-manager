import { RepositoryCollaborator } from "./common";

/**
 * GitHub repository information
 */
export interface Repository {
  id: string;
  name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description?: string;
  html_url: string;
  createdAt?: string;
  collaborators?: RepositoryCollaborator[];
}

/**
 * Form data for repository collaborator operations
 */
export interface RepositoryCollaboratorFormData {
  username: string;
  permission: "read" | "triage" | "write" | "maintain" | "admin";
}
