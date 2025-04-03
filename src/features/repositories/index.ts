// Re-export public API from each module
export * from "./stores";
export * from "./services";
// export * from "./hooks"; // No hooks to export
export * from "./validation";
export * from "./types";
// Avoid duplicate exports by not exporting directly from API
// export * from "./api";

// Create a repository-related exports object for convenience
import {
  repositoryCrudService,
  repositoryCollaboratorService,
  repositorySearchService,
} from "./services";
import { repositoryStore } from "./stores";

export const Repositories = {
  store: repositoryStore,
  services: {
    crud: repositoryCrudService,
    collaborator: repositoryCollaboratorService,
    search: repositorySearchService,
  },
};
