/**
 * Core domain types
 * This index exports all domain types with a clean organization
 */

// Import types we need for the AllAppData interface
import type { Project } from "./project";
import type { Repository } from "./repository";
import type { UserProfile } from "./user";

// Application types
export interface AllAppData {
  user: UserProfile;
  repositories: Repository[];
  projects: Project[];
}

// User domain
export type { User, AuthState, UserProfile } from "./user";

// Project domain
export type { Project, ProjectRepository, ProjectFormData } from "./project";

// Repository domain
export type { Repository, RepositoryCollaboratorFormData } from "./repository";

// Board and Column types
export type {
  BoardIssue,
  Column,
  ColumnFormData,
  Label,
  RepositoryCollaborator,
  CollaboratorFormData,
} from "./common";

// Export enums directly (not as types)
export { ColumnType, CollaboratorRole } from "./common";
