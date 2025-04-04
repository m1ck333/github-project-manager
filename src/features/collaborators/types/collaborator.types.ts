/**
 * Collaborator interface
 */
export interface Collaborator {
  id: string;
  login: string;
  avatarUrl: string;
  permission: CollaboratorPermission;
}

/**
 * Collaborator permission type
 */
export type CollaboratorPermission = "READ" | "WRITE" | "ADMIN" | "TRIAGE" | "MAINTAIN";

/**
 * Collaborator form data
 */
export interface CollaboratorFormData {
  username: string;
  permission: string;
}
