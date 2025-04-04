import { collaboratorService } from "../collaborators/services";

import { repositoryCrudService, repositorySearchService } from "./services";
import { repositoryStore } from "./stores";

// Re-export types
export * from "./types";

// Export API operations
export {
  RepositoryVisibility,
  GetAllInitialDataDocument,
  CreateRepositoryDocument,
  DisableRepositoryDocument,
  GetRepositoryCollaboratorsDocument,
  CheckRepositoryCollaboratorDocument,
  AddRepositoryCollaboratorDocument,
  RemoveRepositoryCollaboratorDocument,
} from "./api";

// Export other feature modules
export * from "./services";
export * from "./stores";
export * from "./mappers";

// Feature export object
export const Repositories = {
  store: repositoryStore,
  services: {
    crud: repositoryCrudService,
    collaborator: collaboratorService,
    search: repositorySearchService,
  },
};
