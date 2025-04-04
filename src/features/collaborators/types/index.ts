/**
 * Re-export all collaborator types
 */
export * from "./collaborator.types";

/**
 * Role types for collaborators
 */
export enum CollaboratorRole {
  READ = "READ",
  TRIAGE = "TRIAGE",
  WRITE = "WRITE",
  MAINTAIN = "MAINTAIN",
  ADMIN = "ADMIN",
}

/**
 * Collaborator form data for adding a collaborator
 */
export interface CollaboratorFormData {
  username: string;
  role: CollaboratorRole;
}

/**
 * Collaborator type with additional fields for UI state
 */
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
