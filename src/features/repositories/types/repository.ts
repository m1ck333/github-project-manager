/**
 * Repository owner
 */
export interface RepositoryOwner {
  login: string;
  avatar_url: string;
}

/**
 * Repository collaborator
 */
export interface RepositoryCollaborator {
  id: string;
  login: string;
  avatarUrl: string;
  permission: string;
  isCurrentUser?: boolean;
}

/**
 * Repository
 */
export interface Repository {
  id: string;
  name: string;
  description?: string;
  html_url?: string;
  url?: string;
  owner: RepositoryOwner;
  createdAt: string;
  updatedAt?: string;
  isPrivate?: boolean;
  visibility?: string;
  collaborators?: RepositoryCollaborator[];
}

/**
 * Repository collaborator form data
 */
export interface RepositoryCollaboratorFormData {
  username: string;
  permission: string;
}
