// Re-export public API from each module
export * from "./types";
export * from "./stores";
export * from "./services";
export * from "./validation";

// Create a project-related exports object for convenience
import { projectCrudService, projectRelationsService, projectIssueService } from "./services";
import { projectStore } from "./stores";

export const Projects = {
  store: projectStore,
  services: {
    crud: projectCrudService,
    relations: projectRelationsService,
    issues: projectIssueService,
  },
};
