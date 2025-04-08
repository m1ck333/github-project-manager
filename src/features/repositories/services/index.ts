// Import and export all services
import { collaboratorService } from "../../collaborators/services";

import { AbstractRepositoryService } from "./abstract-repository.service";
import { RepositoryCrudService, repositoryCrudService } from "./repository-crud.service";
import { RepositorySearchService, repositorySearchService } from "./repository-search.service";

// Export service classes for testing or other uses
export { AbstractRepositoryService, RepositoryCrudService, RepositorySearchService };

// Export singleton instances
export { repositoryCrudService, repositorySearchService };

// Export collaborator service directly
export { collaboratorService };

// For backward compatibility - export crud service as repositoryService
export const repositoryService = repositoryCrudService;
