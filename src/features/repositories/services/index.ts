// Import and export all services
import { collaboratorService } from "../../collaborators/services";

import { RepositoryCrudService, repositoryCrudService } from "./repository-crud.service";
import { RepositorySearchService, repositorySearchService } from "./repository-search.service";

// Export singleton instances
export { repositoryCrudService, repositorySearchService };

// Export collaborator service directly
export { collaboratorService };

// Export service classes for testing or other uses
export { RepositoryCrudService, RepositorySearchService };

// For backward compatibility - export crud service as repositoryService
export const repositoryService = repositoryCrudService;
