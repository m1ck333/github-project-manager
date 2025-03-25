export interface Project {
  id: string;
  name: string;
  description?: string;
  boards: Board[];
  collaborators: Collaborator[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  labels: Label[];
}

export interface Column {
  id: string;
  name: string;
  issues: Issue[];
}

export interface Issue {
  id: string;
  title: string;
  description?: string;
  state: IssueState;
  labels: Label[];
  assignees: User[];
}

export interface Label {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface User {
  id: string;
  login: string;
  avatarUrl: string;
}

export interface Collaborator {
  user: User;
  role: CollaboratorRole;
}

export enum IssueState {
  _OPEN = "OPEN",
  _CLOSED = "CLOSED",
  _IN_PROGRESS = "IN_PROGRESS",
  _REVIEW = "REVIEW",
}

export enum CollaboratorRole {
  _OWNER = "OWNER",
  _ADMIN = "ADMIN",
  _MEMBER = "MEMBER",
}
