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
  GET_USER_REPOSITORIES: "GetUserRepositories",
  GET_REPO_COLLABORATORS: (owner: string, name: string) => `GetRepoCollaborators_${owner}_${name}`,
  CREATE_REPOSITORY: "CreateRepository",

  // Project operations
  GET_PROJECTS: "GetProjects",
  GET_PROJECT: (id: string) => `GetProject_${id}`,
  CREATE_PROJECT: "CreateProject",
  UPDATE_PROJECT: (id: string) => `UpdateProject_${id}`,
  DELETE_PROJECT: (id: string) => `DeleteProject_${id}`,

  // Issue operations
  GET_ISSUES: (projectId: string) => `GetIssues_${projectId}`,
  CREATE_ISSUE: "CreateIssue",
  UPDATE_ISSUE: "UpdateIssue",

  // Column operations
  GET_COLUMNS: (projectId: string) => `GetColumns_${projectId}`,
  CREATE_COLUMN: "CreateColumn",
  UPDATE_COLUMN: "UpdateColumn",
  DELETE_COLUMN: "DeleteColumn",
};
