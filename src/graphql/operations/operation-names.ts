/**
 * This file maps old document constant names to new ones
 * to help with the refactoring transition.
 */
import {
  GetColumnsDocument,
  GetProjectDocument,
  GetProjectIssuesDocument,
  GetProjectsDocument,
  GetViewerDocument,
  ProjectV2Roles,
  ProjectV2FieldType,
  UpdateIssueStatusDocument,
  UpdateProjectDocument,
  CreateProjectDocument,
  DeleteProjectDocument,
  CreateIssueDocument,
  UpdateProjectCollaboratorsDocument,
} from "../generated/graphql";

// Export project documents
export {
  GetProjectDocument,
  GetProjectsDocument,
  CreateProjectDocument,
  UpdateProjectDocument,
  DeleteProjectDocument,
};

// Export column documents
export { GetColumnsDocument };

// Export issue documents
export { GetProjectIssuesDocument, UpdateIssueStatusDocument, CreateIssueDocument };

// Export collaborator documents
export { UpdateProjectCollaboratorsDocument };

// Export viewer document
export { GetViewerDocument };

// Export enums
export { ProjectV2Roles, ProjectV2FieldType };

// Column Fields Fragment and Document Placeholders
export const ColumnFieldsFragmentDoc = null;
export const IssueFieldsFragmentDoc = null;
