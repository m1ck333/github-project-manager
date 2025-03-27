/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n}":
    types.CollaboratorFieldsFragmentDoc,
  "mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}":
    types.UpdateProjectCollaboratorsDocument,
  "query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100, affiliation: ALL) {\n      nodes {\n        ...CollaboratorFields\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}":
    types.GetRepositoryCollaboratorsDocument,
  "fragment ColumnFields on ProjectV2SingleSelectField {\n  id\n  name\n  options {\n    id\n    name\n    color\n  }\n}":
    types.ColumnFieldsFragmentDoc,
  "query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      fields(first: 20) {\n        nodes {\n          __typename\n          ... on ProjectV2SingleSelectField {\n            ...ColumnFields\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetColumnsDocument,
  "fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  state\n  createdAt\n  updatedAt\n  url\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n  author {\n    login\n    avatarUrl\n  }\n}":
    types.IssueFieldsFragmentDoc,
  "mutation CreateDraftIssue($projectId: ID!, $title: String!, $body: String) {\n  addProjectV2DraftIssue(\n    input: {projectId: $projectId, title: $title, body: $body}\n  ) {\n    projectItem {\n      id\n      content {\n        ... on DraftIssue {\n          id\n          title\n          body\n          createdAt\n          updatedAt\n        }\n      }\n    }\n  }\n}":
    types.CreateDraftIssueDocument,
  "mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $optionId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}":
    types.UpdateIssueStatusDocument,
  "query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              __typename\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            __typename\n            ... on Issue {\n              ...IssueFields\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n              createdAt\n              updatedAt\n            }\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetProjectIssuesDocument,
  "fragment LabelFields on Label {\n  id\n  name\n  color\n  description\n}":
    types.LabelFieldsFragmentDoc,
  "mutation CreateLabel($repositoryId: ID!, $name: String!, $color: String!, $description: String) {\n  createLabel(\n    input: {repositoryId: $repositoryId, name: $name, color: $color, description: $description}\n  ) {\n    label {\n      ...LabelFields\n    }\n  }\n}":
    types.CreateLabelDocument,
  "query GetLabels($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    labels(first: 30) {\n      nodes {\n        ...LabelFields\n      }\n    }\n  }\n}":
    types.GetLabelsDocument,
  "fragment ProjectFields on ProjectV2 {\n  id\n  title\n  shortDescription\n  url\n  createdAt\n  updatedAt\n  owner {\n    __typename\n    ... on User {\n      login\n      avatarUrl\n    }\n    ... on Organization {\n      login\n      avatarUrl\n    }\n  }\n}":
    types.ProjectFieldsFragmentDoc,
  "mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}":
    types.CreateProjectDocument,
  "mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    projectV2 {\n      id\n    }\n  }\n}":
    types.DeleteProjectDocument,
  "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}":
    types.UpdateProjectDocument,
  "query GetProject($id: ID!) {\n  node(id: $id) {\n    __typename\n    ... on ProjectV2 {\n      ...ProjectFields\n    }\n  }\n}":
    types.GetProjectDocument,
  "query GetProjects {\n  viewer {\n    id\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        ...ProjectFields\n      }\n    }\n  }\n}":
    types.GetProjectsDocument,
  "query GetViewer {\n  viewer {\n    id\n    login\n    avatarUrl\n  }\n}":
    types.GetViewerDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n}"
): (typeof documents)["fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100, affiliation: ALL) {\n      nodes {\n        ...CollaboratorFields\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}"
): (typeof documents)["query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100, affiliation: ALL) {\n      nodes {\n        ...CollaboratorFields\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment ColumnFields on ProjectV2SingleSelectField {\n  id\n  name\n  options {\n    id\n    name\n    color\n  }\n}"
): (typeof documents)["fragment ColumnFields on ProjectV2SingleSelectField {\n  id\n  name\n  options {\n    id\n    name\n    color\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      fields(first: 20) {\n        nodes {\n          __typename\n          ... on ProjectV2SingleSelectField {\n            ...ColumnFields\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      fields(first: 20) {\n        nodes {\n          __typename\n          ... on ProjectV2SingleSelectField {\n            ...ColumnFields\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  state\n  createdAt\n  updatedAt\n  url\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n  author {\n    login\n    avatarUrl\n  }\n}"
): (typeof documents)["fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  state\n  createdAt\n  updatedAt\n  url\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n  author {\n    login\n    avatarUrl\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateDraftIssue($projectId: ID!, $title: String!, $body: String) {\n  addProjectV2DraftIssue(\n    input: {projectId: $projectId, title: $title, body: $body}\n  ) {\n    projectItem {\n      id\n      content {\n        ... on DraftIssue {\n          id\n          title\n          body\n          createdAt\n          updatedAt\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["mutation CreateDraftIssue($projectId: ID!, $title: String!, $body: String) {\n  addProjectV2DraftIssue(\n    input: {projectId: $projectId, title: $title, body: $body}\n  ) {\n    projectItem {\n      id\n      content {\n        ... on DraftIssue {\n          id\n          title\n          body\n          createdAt\n          updatedAt\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $optionId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}"
): (typeof documents)["mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $optionId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              __typename\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            __typename\n            ... on Issue {\n              ...IssueFields\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n              createdAt\n              updatedAt\n            }\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    __typename\n    ... on ProjectV2 {\n      id\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              __typename\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    id\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            __typename\n            ... on Issue {\n              ...IssueFields\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n              createdAt\n              updatedAt\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment LabelFields on Label {\n  id\n  name\n  color\n  description\n}"
): (typeof documents)["fragment LabelFields on Label {\n  id\n  name\n  color\n  description\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateLabel($repositoryId: ID!, $name: String!, $color: String!, $description: String) {\n  createLabel(\n    input: {repositoryId: $repositoryId, name: $name, color: $color, description: $description}\n  ) {\n    label {\n      ...LabelFields\n    }\n  }\n}"
): (typeof documents)["mutation CreateLabel($repositoryId: ID!, $name: String!, $color: String!, $description: String) {\n  createLabel(\n    input: {repositoryId: $repositoryId, name: $name, color: $color, description: $description}\n  ) {\n    label {\n      ...LabelFields\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetLabels($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    labels(first: 30) {\n      nodes {\n        ...LabelFields\n      }\n    }\n  }\n}"
): (typeof documents)["query GetLabels($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    labels(first: 30) {\n      nodes {\n        ...LabelFields\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment ProjectFields on ProjectV2 {\n  id\n  title\n  shortDescription\n  url\n  createdAt\n  updatedAt\n  owner {\n    __typename\n    ... on User {\n      login\n      avatarUrl\n    }\n    ... on Organization {\n      login\n      avatarUrl\n    }\n  }\n}"
): (typeof documents)["fragment ProjectFields on ProjectV2 {\n  id\n  title\n  shortDescription\n  url\n  createdAt\n  updatedAt\n  owner {\n    __typename\n    ... on User {\n      login\n      avatarUrl\n    }\n    ... on Organization {\n      login\n      avatarUrl\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}"
): (typeof documents)["mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    projectV2 {\n      id\n    }\n  }\n}"
): (typeof documents)["mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    projectV2 {\n      id\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}"
): (typeof documents)["mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      ...ProjectFields\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProject($id: ID!) {\n  node(id: $id) {\n    __typename\n    ... on ProjectV2 {\n      ...ProjectFields\n    }\n  }\n}"
): (typeof documents)["query GetProject($id: ID!) {\n  node(id: $id) {\n    __typename\n    ... on ProjectV2 {\n      ...ProjectFields\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProjects {\n  viewer {\n    id\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        ...ProjectFields\n      }\n    }\n  }\n}"
): (typeof documents)["query GetProjects {\n  viewer {\n    id\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        ...ProjectFields\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetViewer {\n  viewer {\n    id\n    login\n    avatarUrl\n  }\n}"
): (typeof documents)["query GetViewer {\n  viewer {\n    id\n    login\n    avatarUrl\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
