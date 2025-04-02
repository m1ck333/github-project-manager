import { BoardIssue, Column, Label, RepositoryCollaborator } from "./common";

/**
 * Project represents a GitHub Project v2 with its properties and relationships
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  number?: number;
  url?: string;
  html_url?: string;

  // Relations
  owner?: {
    login: string;
    avatarUrl: string;
  };
  createdBy?: {
    login: string;
    avatarUrl: string;
  };

  // Components
  columns?: Column[];
  issues?: BoardIssue[];
  collaborators?: RepositoryCollaborator[];
  repositories?: ProjectRepository[];
  labels?: Label[];
}

/**
 * Repository associated with a project
 */
export interface ProjectRepository {
  id: string;
  name: string;
  description?: string;
  url?: string;
  owner?: {
    login: string;
  };
}

/**
 * Data for creating or updating a project
 */
export interface ProjectFormData {
  name: string;
  description?: string;
  repositoryIds?: string[];
}
