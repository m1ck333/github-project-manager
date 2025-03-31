/**
 * This file maps GraphQL document constants from the generated file
 * to provide a clean API for the rest of the application.
 */
import {
  GetAllInitialDataDocument,
  UpdateProjectCollaboratorsDocument,
  AddColumnToProjectDocument,
  DeleteColumnDocument,
  UpdateColumnDocument,
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  CreateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
  UpdateProjectDocument,
  AddRepositoryCollaboratorDocument,
  CreateRepositoryDocument,
  DisableRepositoryDocument,
  ProjectV2Roles,
  ProjectV2FieldType,
  CreateLabelDocument,
  AddProjectItemDocument,
  GetViewerDocument,
  DeleteIssueDocument,
} from "../generated/graphql";

// Export app document - keep only this GET operation
export { GetAllInitialDataDocument, GetViewerDocument };

// Export project documents
export { CreateProjectDocument, UpdateProjectDocument, DeleteProjectDocument };

// Export column documents
export {
  AddColumnToProjectDocument as AddColumnDocument,
  DeleteColumnDocument,
  UpdateColumnDocument,
};

// Export issue documents
export {
  CreateIssueDocument,
  UpdateIssueStatusDocument,
  AddProjectItemDocument,
  DeleteIssueDocument,
};

// Export collaborator documents
export { UpdateProjectCollaboratorsDocument, AddRepositoryCollaboratorDocument };

// Export repository documents
export {
  CreateRepositoryDocument,
  LinkRepositoryToProjectDocument,
  DisableRepositoryDocument as DeleteRepositoryDocument, // Alias for backward compatibility
};

// Export label documents
export { CreateLabelDocument };

// Export enums
export { ProjectV2Roles, ProjectV2FieldType };
