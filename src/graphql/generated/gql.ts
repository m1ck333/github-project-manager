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
  "mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}":
    types.UpdateProjectCollaboratorsDocument,
  'mutation AddColumnToProject($fieldId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}':
    types.AddColumnToProjectDocument,
  "mutation DeleteColumn($fieldId: ID!) {\n  deleteProjectV2Field(input: {fieldId: $fieldId}) {\n    clientMutationId\n  }\n}":
    types.DeleteColumnDocument,
  "query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      fields(first: 20) {\n        nodes {\n          ... on ProjectV2SingleSelectField {\n            id\n            name\n            options {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetColumnsDocument,
  "mutation UpdateColumn($fieldId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, name: $name, singleSelectOptions: $options}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        name\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}":
    types.UpdateColumnDocument,
  "fragment ColumnFields on ProjectV2SingleSelectField {\n  id\n  name\n  options {\n    id\n    name\n    color\n  }\n}":
    types.ColumnFieldsFragmentDoc,
  "fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  createdAt\n  updatedAt\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n}":
    types.IssueFieldsFragmentDoc,
  "fragment ProjectFields on ProjectV2 {\n  id\n  title\n  shortDescription\n  url\n  createdAt\n  updatedAt\n  owner {\n    __typename\n    ... on User {\n      login\n      avatarUrl\n    }\n    ... on Organization {\n      login\n      avatarUrl\n    }\n  }\n}":
    types.ProjectFieldsFragmentDoc,
  "mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String, $projectId: ID!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n      number\n    }\n  }\n}":
    types.CreateIssueDocument,
  "query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            ... on Issue {\n              id\n              title\n              body\n              number\n              labels(first: 10) {\n                nodes {\n                  id\n                  name\n                  color\n                  description\n                }\n              }\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n            }\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetProjectIssuesDocument,
  "mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $valueId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}":
    types.UpdateIssueStatusDocument,
  "mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}":
    types.CreateProjectDocument,
  "mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    clientMutationId\n  }\n}":
    types.DeleteProjectDocument,
  "query GetProject($id: ID!) {\n  node(id: $id) {\n    ... on ProjectV2 {\n      id\n      title\n      number\n      closed\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}":
    types.GetProjectDocument,
  "query GetProjects {\n  viewer {\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        closed\n        url\n        createdAt\n        updatedAt\n      }\n    }\n  }\n}":
    types.GetProjectsDocument,
  "mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n    repository {\n      id\n      name\n      url\n    }\n  }\n}":
    types.LinkRepositoryToProjectDocument,
  "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      closed\n      updatedAt\n    }\n  }\n}":
    types.UpdateProjectDocument,
  "mutation AddRepositoryCollaborator($repositoryId: ID!, $userLogin: String!, $permission: RepositoryPermission!) {\n  addAssignable: addAssigneesToAssignable(\n    input: {assignableId: $repositoryId, assigneeIds: []}\n  ) {\n    clientMutationId\n  }\n}":
    types.AddRepositoryCollaboratorDocument,
  "mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      owner {\n        login\n        avatarUrl\n      }\n      description\n      url\n      createdAt\n    }\n  }\n}":
    types.CreateRepositoryDocument,
  "query GetRepoCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}":
    types.GetRepoCollaboratorsDocument,
  "query GetRepository($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    name\n    description\n    url\n    createdAt\n    owner {\n      login\n      avatarUrl\n    }\n    isPrivate\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n    projectsV2(first: 10) {\n      nodes {\n        id\n        title\n        number\n        url\n      }\n    }\n  }\n}":
    types.GetRepositoryDocument,
  "query GetUserRepositories($first: Int = 100) {\n  viewer {\n    repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        description\n        url\n        createdAt\n        isPrivate\n        owner {\n          login\n          avatarUrl\n        }\n      }\n    }\n  }\n}":
    types.GetUserRepositoriesDocument,
  "query GetUser($login: String!) {\n  user(login: $login) {\n    id\n    login\n    name\n    avatarUrl\n    url\n    bio\n  }\n}":
    types.GetUserDocument,
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
  source: "mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation UpdateProjectCollaborators($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: 'mutation AddColumnToProject($fieldId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}'
): (typeof documents)['mutation AddColumnToProject($fieldId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation DeleteColumn($fieldId: ID!) {\n  deleteProjectV2Field(input: {fieldId: $fieldId}) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation DeleteColumn($fieldId: ID!) {\n  deleteProjectV2Field(input: {fieldId: $fieldId}) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      fields(first: 20) {\n        nodes {\n          ... on ProjectV2SingleSelectField {\n            id\n            name\n            options {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetColumns($projectId: ID!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      fields(first: 20) {\n        nodes {\n          ... on ProjectV2SingleSelectField {\n            id\n            name\n            options {\n              id\n              name\n              color\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateColumn($fieldId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, name: $name, singleSelectOptions: $options}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        name\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["mutation UpdateColumn($fieldId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {\n  updateProjectV2Field(\n    input: {fieldId: $fieldId, name: $name, singleSelectOptions: $options}\n  ) {\n    projectV2Field {\n      ... on ProjectV2SingleSelectField {\n        id\n        name\n        options {\n          id\n          name\n          color\n        }\n      }\n    }\n  }\n}"];
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
  source: "fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  createdAt\n  updatedAt\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n}"
): (typeof documents)["fragment IssueFields on Issue {\n  id\n  title\n  body\n  number\n  createdAt\n  updatedAt\n  labels(first: 10) {\n    nodes {\n      id\n      name\n      color\n      description\n    }\n  }\n}"];
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
  source: "mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String, $projectId: ID!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n      number\n    }\n  }\n}"
): (typeof documents)["mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String, $projectId: ID!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n      number\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            ... on Issue {\n              id\n              title\n              body\n              number\n              labels(first: 10) {\n                nodes {\n                  id\n                  name\n                  color\n                  description\n                }\n              }\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n            }\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetProjectIssues($projectId: ID!, $first: Int!) {\n  node(id: $projectId) {\n    ... on ProjectV2 {\n      items(first: $first) {\n        nodes {\n          id\n          fieldValues(first: 20) {\n            nodes {\n              ... on ProjectV2ItemFieldSingleSelectValue {\n                name\n                field {\n                  ... on ProjectV2SingleSelectField {\n                    name\n                  }\n                }\n              }\n            }\n          }\n          content {\n            ... on Issue {\n              id\n              title\n              body\n              number\n              labels(first: 10) {\n                nodes {\n                  id\n                  name\n                  color\n                  description\n                }\n              }\n            }\n            ... on DraftIssue {\n              id\n              title\n              body\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $valueId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}"
): (typeof documents)["mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $valueId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"
): (typeof documents)["mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProject($id: ID!) {\n  node(id: $id) {\n    ... on ProjectV2 {\n      id\n      title\n      number\n      closed\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"
): (typeof documents)["query GetProject($id: ID!) {\n  node(id: $id) {\n    ... on ProjectV2 {\n      id\n      title\n      number\n      closed\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProjects {\n  viewer {\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        closed\n        url\n        createdAt\n        updatedAt\n      }\n    }\n  }\n}"
): (typeof documents)["query GetProjects {\n  viewer {\n    projectsV2(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        closed\n        url\n        createdAt\n        updatedAt\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n    repository {\n      id\n      name\n      url\n    }\n  }\n}"
): (typeof documents)["mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n    repository {\n      id\n      name\n      url\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      closed\n      updatedAt\n    }\n  }\n}"
): (typeof documents)["mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      closed\n      updatedAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation AddRepositoryCollaborator($repositoryId: ID!, $userLogin: String!, $permission: RepositoryPermission!) {\n  addAssignable: addAssigneesToAssignable(\n    input: {assignableId: $repositoryId, assigneeIds: []}\n  ) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation AddRepositoryCollaborator($repositoryId: ID!, $userLogin: String!, $permission: RepositoryPermission!) {\n  addAssignable: addAssigneesToAssignable(\n    input: {assignableId: $repositoryId, assigneeIds: []}\n  ) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      owner {\n        login\n        avatarUrl\n      }\n      description\n      url\n      createdAt\n    }\n  }\n}"
): (typeof documents)["mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      owner {\n        login\n        avatarUrl\n      }\n      description\n      url\n      createdAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetRepoCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}"
): (typeof documents)["query GetRepoCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetRepository($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    name\n    description\n    url\n    createdAt\n    owner {\n      login\n      avatarUrl\n    }\n    isPrivate\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n    projectsV2(first: 10) {\n      nodes {\n        id\n        title\n        number\n        url\n      }\n    }\n  }\n}"
): (typeof documents)["query GetRepository($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    name\n    description\n    url\n    createdAt\n    owner {\n      login\n      avatarUrl\n    }\n    isPrivate\n    collaborators(first: 100) {\n      nodes {\n        id\n        login\n        avatarUrl\n      }\n      edges {\n        permission\n      }\n    }\n    projectsV2(first: 10) {\n      nodes {\n        id\n        title\n        number\n        url\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetUserRepositories($first: Int = 100) {\n  viewer {\n    repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        description\n        url\n        createdAt\n        isPrivate\n        owner {\n          login\n          avatarUrl\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetUserRepositories($first: Int = 100) {\n  viewer {\n    repositories(first: $first, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        description\n        url\n        createdAt\n        isPrivate\n        owner {\n          login\n          avatarUrl\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetUser($login: String!) {\n  user(login: $login) {\n    id\n    login\n    name\n    avatarUrl\n    url\n    bio\n  }\n}"
): (typeof documents)["query GetUser($login: String!) {\n  user(login: $login) {\n    id\n    login\n    name\n    avatarUrl\n    url\n    bio\n  }\n}"];
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
