import { ProjectCrudService } from "./project-crud.service";
import { ProjectIssueService } from "./project-issue.service";
import { ProjectRelationsService } from "./project-relations.service";

// Create singleton instances
export const projectCrudService = new ProjectCrudService();
export const projectRelationsService = new ProjectRelationsService();
export const projectIssueService = new ProjectIssueService();

// Export service classes for testing or other uses
export { ProjectCrudService, ProjectRelationsService, ProjectIssueService };
