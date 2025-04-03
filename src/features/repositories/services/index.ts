// Import and export all services
import {
  RepositoryCollaboratorService,
  repositoryCollaboratorService,
} from "./repository-collaborator.service";
import { RepositoryCrudService, repositoryCrudService } from "./repository-crud.service";
import { RepositorySearchService, repositorySearchService } from "./repository-search.service";

// Export singleton instances
export { repositoryCrudService, repositoryCollaboratorService, repositorySearchService };

// Export service classes for testing or other uses
export { RepositoryCrudService, RepositoryCollaboratorService, RepositorySearchService };

// For backward compatibility - export crud service as repositoryService
export const repositoryService = repositoryCrudService;
