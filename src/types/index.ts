export interface Project {
  id: number;
  name: string;
  description: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  boards?: Board[];
  collaborators?: Collaborator[];
}

export enum BoardType {
  TODO = "Todo",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
  BACKLOG = "Backlog",
}

export interface Board {
  id: number;
  name: string;
  type: BoardType;
  issues?: Issue[];
}

export enum CollaboratorRole {
  ADMIN = "Admin",
  WRITE = "Write",
  READ = "Read",
}

export interface Collaborator {
  id: number;
  username: string;
  avatar?: string;
  role: CollaboratorRole;
}

export interface Issue {
  id: number;
  title: string;
  description?: string;
  labels?: string[];
  assignee?: string;
  status: BoardType;
}

export interface ProjectFormData {
  name: string;
  description: string;
}

export interface BoardFormData {
  name: string;
  type: BoardType;
}

export interface CollaboratorFormData {
  username: string;
  role: CollaboratorRole;
}
