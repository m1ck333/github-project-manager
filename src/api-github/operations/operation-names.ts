/**
 * This file maps GraphQL document constants from the generated file
 * to provide a clean API for the rest of the application.
 */
import {
  GetAllInitialDataDocument,
  GetViewerDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  AddCollaboratorDocument,
  RemoveCollaboratorDocument,
  CreateRepositoryDocument,
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  DeleteIssueDocument,
  AddProjectItemDocument,
  CreateLabelDocument,
  LinkRepositoryToProjectDocument,
  ProjectV2Roles,
  ProjectV2FieldType,
  AddColumnDocument,
  DisableRepositoryDocument,
} from "../generated/graphql";

// =============================================================================
// Application Operations
// =============================================================================

export { GetAllInitialDataDocument, GetViewerDocument };

// =============================================================================
// Project Operations
// =============================================================================

export {
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
  AddColumnDocument,
  AddProjectItemDocument,
};

// =============================================================================
// Issue Operations
// =============================================================================

export { CreateIssueDocument, UpdateIssueStatusDocument, DeleteIssueDocument };

// =============================================================================
// Label Operations
// =============================================================================

export { CreateLabelDocument };

// =============================================================================
// Repository Operations
// =============================================================================

export { CreateRepositoryDocument, DisableRepositoryDocument };

// =============================================================================
// Collaborator Operations
// =============================================================================

export { AddCollaboratorDocument, RemoveCollaboratorDocument };

// =============================================================================
// Enums
// =============================================================================

export { ProjectV2Roles, ProjectV2FieldType };
