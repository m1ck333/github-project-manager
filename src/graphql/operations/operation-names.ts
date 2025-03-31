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
  ProjectV2Roles,
  ProjectV2FieldType,
} from "../generated/graphql";

// Export app document - keep only this GET operation
export { GetAllInitialDataDocument };

// Export project documents
export {
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
  LinkRepositoryToProjectDocument,
};

// Export column documents
export {
  AddColumnToProjectDocument as AddColumnDocument,
  DeleteColumnDocument,
  UpdateColumnDocument,
};

// Export issue documents
export { CreateIssueDocument, UpdateIssueStatusDocument };

// Export collaborator documents
export { UpdateProjectCollaboratorsDocument, AddRepositoryCollaboratorDocument };

// Export repository documents
export { CreateRepositoryDocument };

// Export enums
export { ProjectV2Roles, ProjectV2FieldType };
