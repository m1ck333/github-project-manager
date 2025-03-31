/**
 * GraphQL Operation Names
 *
 * This file contains constant names for GraphQL operations to provide
 * better identification in the network tab when inspecting requests.
 */

export const OPERATIONS = {
  // Auth operations
  VALIDATE_TOKEN: "ValidateGitHubToken",

  // Repository operations
  CREATE_REPOSITORY: "CreateRepository",
  ADD_REPO_COLLABORATOR: (repoId: string, username: string) =>
    `AddRepoCollaborator:${repoId}/${username}`,
  REMOVE_REPO_COLLABORATOR: (repoId: string, username: string) =>
    `RemoveRepoCollaborator:${repoId}/${username}`,

  // Project operations
  CREATE_PROJECT: "CreateProject",
  UPDATE_PROJECT: (id: string) => `UpdateProject:${id}`,
  DELETE_PROJECT: (id: string) => `DeleteProject:${id}`,
  LINK_REPOSITORY_TO_PROJECT: (projectId: string, repositoryId: string) =>
    `LinkRepositoryToProject:${projectId}/${repositoryId}`,

  // Issue operations
  CREATE_ISSUE: "CreateIssue",
  UPDATE_ISSUE: "UpdateIssue",

  // Column operations
  CREATE_COLUMN: "CreateColumn",
  UPDATE_COLUMN: "UpdateColumn",
  DELETE_COLUMN: "DeleteColumn",

  // Collaborator operations
  ADD_COLLABORATOR: (projectId: string) => `AddCollaborator:${projectId}`,
  REMOVE_COLLABORATOR: (projectId: string, collaboratorId: string) =>
    `RemoveCollaborator:${projectId}/${collaboratorId}`,
};
