import { issueService } from "../../issues/services";
import { labelService } from "../../labels/services";

import { ProjectCrudService } from "./project-crud.service";
import { ProjectRelationsService } from "./project-relations.service";
import { ProjectSearchService } from "./project-search.service";

// Create singleton instances
export const projectCrudService = new ProjectCrudService();
export const projectRelationsService = new ProjectRelationsService();
export const projectSearchService = new ProjectSearchService();

// Export standalone services directly
export { issueService, labelService };

// Export service classes for testing or other uses
export { ProjectCrudService, ProjectRelationsService, ProjectSearchService };
