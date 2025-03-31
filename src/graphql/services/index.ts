/**
 * Service exports
 *
 * NOTE: We should gradually transition from these services to using
 * generated GraphQL hooks directly in our MobX stores.
 *
 * Benefits of using generated hooks:
 * 1. Type safety with auto-generated types
 * 2. Less code maintenance (no need to manually sync with GraphQL schema)
 * 3. Better integration with React's rendering lifecycle
 * 4. Automatic caching and state management
 *
 * Steps for transition:
 * 1. Use AppInitializationService to load initial data
 * 2. Import hooks from generated GraphQL files for mutations
 * 3. Move business logic to MobX stores
 */

// Export service classes
export { ProjectService } from "./ProjectService";
export { ColumnService } from "./ColumnService";
export { IssueService } from "./IssueService";
export { CollaboratorService } from "./CollaboratorService";
export { RepositoryService } from "./RepositoryService";
export { UserService } from "./UserService";
export type { GitHubUserProfile, TokenValidationResult } from "./UserService";
export { LabelService } from "./LabelService";

// Create service instances
import { appInitializationService } from "./AppInitializationService";
import { CollaboratorService } from "./CollaboratorService";
import { ColumnService } from "./ColumnService";
import { IssueService } from "./IssueService";
import { LabelService } from "./LabelService";
import { ProjectService } from "./ProjectService";
import { RepositoryService } from "./RepositoryService";
import { userService } from "./UserService";

// Service instances for use throughout the application
export const projectService = new ProjectService();
export const columnService = new ColumnService();
export const issueService = new IssueService();
export const collaboratorService = new CollaboratorService();
export const repositoryService = new RepositoryService();
export const labelService = new LabelService();
export { userService, appInitializationService };

// These would be instantiated as the services are implemented
// export const labelService = new LabelService();
