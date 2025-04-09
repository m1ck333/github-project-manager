// Import project services and store
import { projectCrudService, projectRelatedService, projectSearchService } from "./services";
import { projectStore } from "./stores";

// Re-export components and types
export * from "./components";
export * from "./mappers";
export * from "./hooks";
export * from "./validation";
export type { Project, ProjectState } from "./types";

// Export the Projects namespace with consistent structure
export const Projects = {
  store: projectStore,
  services: {
    crud: projectCrudService,
    related: projectRelatedService,
    search: projectSearchService,
  },
};

// Export the store directly for easier imports
export { projectStore };
