/**
 * Column types for project boards
 */
export enum ColumnType {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BACKLOG = "BACKLOG",
}

/**
 * Column represents a project board column/status
 */
export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  fieldId?: string;
  fieldName?: string;
  projectId?: string;
  options?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

/**
 * Column form data for creating/updating columns
 */
export interface ColumnFormData {
  name: string;
  type: ColumnType;
}

/**
 * Issue represents a GitHub issue in the context of a project
 */
export interface BoardIssue {
  id: string;
  title: string;
  body?: string;
  issueId?: string;
  statusId?: string;
  status?: string;
  columnId?: string;
  columnName?: string;
  labels?: Label[];
  number?: number;
  isDraft?: boolean;
  projectItemId?: string;
  state?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    login: string;
    avatarUrl: string;
  } | null;
  assignees?: Array<{
    login: string;
    avatarUrl: string;
  }>;
}

/**
 * Label for issues and PRs
 */
export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

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
