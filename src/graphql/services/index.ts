/**
 * Services Export File
 *
 * This file exports all services to provide a clean API for the rest of the application.
 */

// Export service classes
export { ProjectService } from "./ProjectService";
export { ColumnService } from "./ColumnService";
export { IssueService } from "./IssueService";
// These would be implemented and exported as the application grows
// export { LabelService } from "./LabelService";
// export { CollaboratorService } from "./CollaboratorService";

// Create service instances
import { ProjectService } from "./ProjectService";
import { ColumnService } from "./ColumnService";
import { IssueService } from "./IssueService";

// Service instances for use throughout the application
export const projectService = new ProjectService();
export const columnService = new ColumnService();
export const issueService = new IssueService();

// These would be instantiated as the services are implemented
// export const labelService = new LabelService();
// export const collaboratorService = new CollaboratorService();
