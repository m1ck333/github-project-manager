import {
  projectCrudService,
  projectIssueService,
  projectRelationsService,
  projectSearchService,
} from "./services";
import { projectStore } from "./stores";

// Public API
export * from "./types";
export * from "./components";
export * from "./services";
export * from "./stores";
export * from "./validation";

// Convenience export for external modules
export const Projects = {
  store: projectStore,
  services: {
    crud: projectCrudService,
    issues: projectIssueService,
    relations: projectRelationsService,
    search: projectSearchService,
  },
};
