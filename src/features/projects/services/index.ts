// Import feature-specific services
import { columnService } from "../../columns/services";
import { issueService } from "../../issues/services";
import { labelService } from "../../labels/services";

// Import project services
import { ProjectCrudService } from "./project-crud.service";
import { ProjectRelatedService } from "./project-related.service";
import { ProjectSearchService } from "./project-search.service";

// Re-export search engine utilities
export * from "../utils";

// Create service instances
export const projectCrudService = new ProjectCrudService();
export const projectRelatedService = new ProjectRelatedService((id: string) =>
  projectCrudService.getById(id)
);
export const projectSearchService = new ProjectSearchService();

// Export service classes
export { ProjectCrudService, ProjectRelatedService, ProjectSearchService };
export { columnService, issueService, labelService };
