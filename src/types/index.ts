export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    login: string;
    avatarUrl: string;
  };
  url: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  columns?: Column[];
  issues?: BoardIssue[];
  collaborators?: Collaborator[];
  repositories?: Repository[];
  labels?: Label[];
}

export enum ColumnType {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BACKLOG = "BACKLOG",
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  fieldId?: string;
  fieldName?: string;
  options?: Array<{
    id: string;
    name: string;
    color?: string;
  }>;
}

export enum CollaboratorRole {
  READ = "READ",
  WRITE = "WRITE",
  ADMIN = "ADMIN",
}

export interface Collaborator {
  id: string;
  username: string;
  avatar: string;
  role: CollaboratorRole;
  isOrganization?: boolean;
  isNote?: boolean;
  isCurrentUser?: boolean;
  isTeam?: boolean;
}

export interface Issue {
  id: string;
  title: string;
  body?: string;
  statusId?: string;
  labels?: Label[];
  number?: number;
  isDraft?: boolean;
  projectItemId?: string;
  state?: string;
  url?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extended Issue type with columnId for board functionality
 */
export interface BoardIssue extends Issue {
  columnId?: string;
  columnName?: string;
  issueId?: string;
  status?: string;
  author?: {
    login: string;
    avatarUrl: string;
  } | null;
  assignees?: Array<{
    login: string;
    avatarUrl: string;
  }>;
}

export interface ProjectFormData {
  name: string;
  description: string;
}

export interface ColumnFormData {
  name: string;
  type: ColumnType;
}

export interface CollaboratorFormData {
  username: string;
  role: CollaboratorRole;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  type: "ISSUE" | "PULL_REQUEST" | "DRAFT_ISSUE";
  content?: Issue;
  columnId?: string;
}

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

export interface RepositoryCollaborator {
  id: string;
  login: string;
  avatarUrl: string;
  permission: string;
  isCurrentUser?: boolean;
}

export interface RepositoryCollaboratorFormData {
  username: string;
  permission: "read" | "triage" | "write" | "maintain" | "admin";
}

// Export app initialization types
export * from "./app-initialization";
