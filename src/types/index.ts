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
  collaborators?: Collaborator[];
  repositories?: Repository[];
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
