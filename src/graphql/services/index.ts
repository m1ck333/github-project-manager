/**
 * Services Export File
 *
 * This file exports all services to provide a clean API for the rest of the application.
 */

// Export service classes
export { ProjectService } from "./ProjectService";
export { ColumnService } from "./ColumnService";
export { IssueService } from "./IssueService";
export { CollaboratorService } from "./CollaboratorService";
export { RepositoryService } from "./RepositoryService";
export { UserService } from "./UserService";
export type { GitHubUserProfile, TokenValidationResult } from "./UserService";
export { LabelService } from "./LabelService";
// These would be implemented and exported as the application grows
// export { LabelService } from "./LabelService";

// Create service instances
import { CollaboratorService } from "./CollaboratorService";
import { ColumnService } from "./ColumnService";
import { IssueService } from "./IssueService";
import { LabelService } from "./LabelService";
import { ProjectService } from "./ProjectService";
import { RepositoryService } from "./RepositoryService";
import { userService } from "./UserService";

// Service instances for use throughout the application
export const projectService = new ProjectService();
export const columnService = new ColumnService();
export const issueService = new IssueService();
export const collaboratorService = new CollaboratorService();
export const repositoryService = new RepositoryService();
export const labelService = new LabelService();
export { userService };

// These would be instantiated as the services are implemented
// export const labelService = new LabelService();
