/**
 * GraphQL Operation Names
 *
 * This file contains constant names for GraphQL operations to provide
 * better identification in the network tab when inspecting requests.
 */

export const OPERATIONS = {
  // Auth operations
  VALIDATE_TOKEN: "ValidateGitHubToken",
  GET_USER_PROFILE: "GetUserProfile",

  // Repository operations
  GET_REPOSITORY: (owner: string, name: string) => `GetRepository_${owner}_${name}`,
  GET_REPO_ID: (owner: string, name: string) => `GetRepoId_${owner}_${name}`,
  GET_USER_REPOSITORIES: "GetUserRepositories",
  GET_REPO_COLLABORATORS: (owner: string, repoName: string) =>
    `GetRepoCollaborators:${owner}/${repoName}`,
  CREATE_REPOSITORY: "CreateRepository",
  ADD_REPO_COLLABORATOR: (repoId: string, username: string) =>
    `AddRepoCollaborator:${repoId}/${username}`,
  REMOVE_REPO_COLLABORATOR: (repoId: string, username: string) =>
    `RemoveRepoCollaborator:${repoId}/${username}`,

  // Project operations
  GET_PROJECTS: "GetProjects",
  GET_PROJECT: (id: string) => `GetProject_${id}`,
  CREATE_PROJECT: "CreateProject",
  UPDATE_PROJECT: (id: string) => `UpdateProject:${id}`,
  DELETE_PROJECT: (id: string) => `DeleteProject:${id}`,
  LINK_REPOSITORY_TO_PROJECT: (projectId: string, repositoryId: string) =>
    `LinkRepositoryToProject:${projectId}/${repositoryId}`,

  // Issue operations
  GET_ISSUES: (projectId: string) => `GetIssues_${projectId}`,
  CREATE_ISSUE: "CreateIssue",
  UPDATE_ISSUE: "UpdateIssue",

  // Column operations
  GET_COLUMNS: (projectId: string) => `GetColumns_${projectId}`,
  CREATE_COLUMN: "CreateColumn",
  UPDATE_COLUMN: "UpdateColumn",
  DELETE_COLUMN: "DeleteColumn",

  // Collaborator operations
  ADD_COLLABORATOR: (projectId: string) => `AddCollaborator:${projectId}`,
  REMOVE_COLLABORATOR: (projectId: string, collaboratorId: string) =>
    `RemoveCollaborator:${projectId}/${collaboratorId}`,
};
