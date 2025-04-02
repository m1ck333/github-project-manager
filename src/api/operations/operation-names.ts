/**
 * This file maps GraphQL document constants from the generated file
 * to provide a clean API for the rest of the application.
 */
import { TypedDocumentNode } from "@graphql-typed-document-node/core";

import {
  GetAllInitialDataDocument,
  GetViewerDocument,
  CreateProjectDocument,
  AddCollaboratorDocument,
  RemoveCollaboratorDocument,
  ProjectV2Roles,
  ProjectV2FieldType,
} from "../generated/graphql";

// Export app document - keep only this GET operation
export { GetAllInitialDataDocument, GetViewerDocument };

// Export project documents
export { CreateProjectDocument };

// Export collaborator documents
export { AddCollaboratorDocument, RemoveCollaboratorDocument };

// Export enums
export { ProjectV2Roles, ProjectV2FieldType };

// Helper type for mock documents
type MockDocument = TypedDocumentNode<Record<string, unknown>, Record<string, unknown>>;

// For compatibility with existing code, provide empty mock document functions
// These will need to be replaced with real implementations
export const UpdateProjectDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const DeleteProjectDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const LinkRepositoryToProjectDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const AddColumnDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const CreateIssueDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const UpdateIssueStatusDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const CreateLabelDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const AddProjectItemDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
export const DeleteIssueDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;

// Create a correctly typed mock document for CreateRepository
export const CreateRepositoryDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as TypedDocumentNode<
  {
    createRepository: {
      repository: {
        id: string;
        name: string;
        description: string | null;
        url: string;
        createdAt: string;
        owner: {
          login: string;
          avatarUrl: string;
        };
      };
    };
  },
  Record<string, unknown>
>;

export const AddRepositoryCollaboratorDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;

export const RemoveRepositoryCollaboratorDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;

export const DeleteRepositoryDocument: MockDocument = {
  kind: "Document",
  definitions: [],
} as MockDocument;
