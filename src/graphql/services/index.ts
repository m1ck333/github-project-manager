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
// These would be implemented and exported as the application grows
// export { LabelService } from "./LabelService";

// Create service instances
import { ProjectService } from "./ProjectService";
import { ColumnService } from "./ColumnService";
import { IssueService } from "./IssueService";
import { CollaboratorService } from "./CollaboratorService";
import { RepositoryService } from "./RepositoryService";

// Service instances for use throughout the application
export const projectService = new ProjectService();
export const columnService = new ColumnService();
export const issueService = new IssueService();
export const collaboratorService = new CollaboratorService();
export const repositoryService = new RepositoryService();

// These would be instantiated as the services are implemented
// export const labelService = new LabelService();
