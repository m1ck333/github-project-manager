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
  "query GetAllInitialData {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n    repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        nameWithOwner\n        description\n        url\n        visibility\n        isPrivate\n        isArchived\n        createdAt\n        updatedAt\n        owner {\n          login\n          avatarUrl\n        }\n        labels(first: 100) {\n          nodes {\n            id\n            name\n            color\n            description\n          }\n        }\n        collaborators(first: 20) {\n          edges {\n            permission\n            node {\n              id\n              login\n              name\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetAllInitialDataDocument,
  "mutation AddCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}":
    types.AddCollaboratorDocument,
  "mutation RemoveCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}":
    types.RemoveCollaboratorDocument,
  "mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      number\n      title\n      body\n    }\n  }\n}":
    types.CreateIssueDocument,
  "mutation DeleteIssue($issueId: ID!) {\n  deleteIssue(input: {issueId: $issueId}) {\n    repository {\n      id\n    }\n  }\n}":
    types.DeleteIssueDocument,
  "mutation UpdateIssueStatus($projectId: ID!, $itemId: ID!, $fieldId: ID!, $valueId: String!) {\n  updateProjectV2ItemFieldValue(\n    input: {projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: {singleSelectOptionId: $valueId}}\n  ) {\n    projectV2Item {\n      id\n    }\n  }\n}":
    types.UpdateIssueStatusDocument,
  "mutation CreateLabel($input: CreateLabelInput!) {\n  createLabel(input: $input) {\n    label {\n      id\n      name\n      color\n      description\n    }\n  }\n}":
    types.CreateLabelDocument,
  'mutation AddColumn($projectId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  createProjectV2Field(\n    input: {projectId: $projectId, name: $name, dataType: SINGLE_SELECT, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    clientMutationId\n  }\n}':
    types.AddColumnDocument,
  "mutation AddProjectItem($input: AddProjectV2ItemByIdInput!) {\n  addProjectV2ItemById(input: $input) {\n    item {\n      id\n    }\n  }\n}":
    types.AddProjectItemDocument,
  "mutation CreateProject($input: CreateProjectV2Input!) {\n  createProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}":
    types.CreateProjectDocument,
  "mutation DeleteProject($input: DeleteProjectV2Input!) {\n  deleteProjectV2(input: $input) {\n    clientMutationId\n  }\n}":
    types.DeleteProjectDocument,
  "mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n  }\n}":
    types.LinkRepositoryToProjectDocument,
  "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}":
    types.UpdateProjectDocument,
  "query GetProjects {\n  viewer {\n    login\n    avatarUrl\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}":
    types.GetProjectsDocument,
  "fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n  url\n}":
    types.CollaboratorFieldsFragmentDoc,
  "mutation AddRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}":
    types.AddRepositoryCollaboratorDocument,
  "mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      description\n      url\n      createdAt\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n}":
    types.CreateRepositoryDocument,
  "mutation DisableRepository($repositoryId: ID!) {\n  updateRepository(\n    input: {repositoryId: $repositoryId, hasIssuesEnabled: false, hasProjectsEnabled: false, hasWikiEnabled: false}\n  ) {\n    repository {\n      id\n      name\n    }\n  }\n}":
    types.DisableRepositoryDocument,
  "mutation RemoveRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}":
    types.RemoveRepositoryCollaboratorDocument,
  "query CheckRepositoryCollaborator($owner: String!, $name: String!, $username: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 1, query: $username) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}":
    types.CheckRepositoryCollaboratorDocument,
  "query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}":
    types.GetRepositoryCollaboratorsDocument,
  "query GetUserProfile {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n  }\n}":
    types.GetUserProfileDocument,
  "query GetViewer {\n  viewer {\n    id\n    login\n  }\n}": types.GetViewerDocument,
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
  source: "query GetAllInitialData {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n    repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        nameWithOwner\n        description\n        url\n        visibility\n        isPrivate\n        isArchived\n        createdAt\n        updatedAt\n        owner {\n          login\n          avatarUrl\n        }\n        labels(first: 100) {\n          nodes {\n            id\n            name\n            color\n            description\n          }\n        }\n        collaborators(first: 20) {\n          edges {\n            permission\n            node {\n              id\n              login\n              name\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetAllInitialData {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n    repositories(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        name\n        nameWithOwner\n        description\n        url\n        visibility\n        isPrivate\n        isArchived\n        createdAt\n        updatedAt\n        owner {\n          login\n          avatarUrl\n        }\n        labels(first: 100) {\n          nodes {\n            id\n            name\n            color\n            description\n          }\n        }\n        collaborators(first: 20) {\n          edges {\n            permission\n            node {\n              id\n              login\n              name\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation AddCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation AddCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation RemoveCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation RemoveCollaborator($projectId: ID!, $collaborators: [ProjectV2Collaborator!]!) {\n  updateProjectV2Collaborators(\n    input: {projectId: $projectId, collaborators: $collaborators}\n  ) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      number\n      title\n      body\n    }\n  }\n}"
): (typeof documents)["mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      number\n      title\n      body\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation DeleteIssue($issueId: ID!) {\n  deleteIssue(input: {issueId: $issueId}) {\n    repository {\n      id\n    }\n  }\n}"
): (typeof documents)["mutation DeleteIssue($issueId: ID!) {\n  deleteIssue(input: {issueId: $issueId}) {\n    repository {\n      id\n    }\n  }\n}"];
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
  source: "mutation CreateLabel($input: CreateLabelInput!) {\n  createLabel(input: $input) {\n    label {\n      id\n      name\n      color\n      description\n    }\n  }\n}"
): (typeof documents)["mutation CreateLabel($input: CreateLabelInput!) {\n  createLabel(input: $input) {\n    label {\n      id\n      name\n      color\n      description\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: 'mutation AddColumn($projectId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  createProjectV2Field(\n    input: {projectId: $projectId, name: $name, dataType: SINGLE_SELECT, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    clientMutationId\n  }\n}'
): (typeof documents)['mutation AddColumn($projectId: ID!, $name: String!, $color: ProjectV2SingleSelectFieldOptionColor!) {\n  createProjectV2Field(\n    input: {projectId: $projectId, name: $name, dataType: SINGLE_SELECT, singleSelectOptions: [{name: $name, color: $color, description: ""}]}\n  ) {\n    clientMutationId\n  }\n}'];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation AddProjectItem($input: AddProjectV2ItemByIdInput!) {\n  addProjectV2ItemById(input: $input) {\n    item {\n      id\n    }\n  }\n}"
): (typeof documents)["mutation AddProjectItem($input: AddProjectV2ItemByIdInput!) {\n  addProjectV2ItemById(input: $input) {\n    item {\n      id\n    }\n  }\n}"];
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
  source: "mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n  }\n}"
): (typeof documents)["mutation LinkRepositoryToProject($input: LinkProjectV2ToRepositoryInput!) {\n  linkProjectV2ToRepository(input: $input) {\n    clientMutationId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"
): (typeof documents)["mutation UpdateProject($input: UpdateProjectV2Input!) {\n  updateProjectV2(input: $input) {\n    projectV2 {\n      id\n      title\n      number\n      url\n      createdAt\n      updatedAt\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetProjects {\n  viewer {\n    login\n    avatarUrl\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}"
): (typeof documents)["query GetProjects {\n  viewer {\n    login\n    avatarUrl\n    projectsV2(first: 50, orderBy: {field: UPDATED_AT, direction: DESC}) {\n      nodes {\n        id\n        title\n        number\n        shortDescription\n        closed\n        url\n        createdAt\n        updatedAt\n        fields(first: 50) {\n          nodes {\n            ... on ProjectV2FieldCommon {\n              id\n              name\n              dataType\n            }\n            ... on ProjectV2SingleSelectField {\n              id\n              name\n              dataType\n              options {\n                id\n                name\n                color\n              }\n            }\n          }\n        }\n        items(first: 100) {\n          nodes {\n            id\n            fieldValues(first: 50) {\n              nodes {\n                ... on ProjectV2ItemFieldTextValue {\n                  text\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldDateValue {\n                  date\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      name\n                      id\n                    }\n                  }\n                }\n                ... on ProjectV2ItemFieldSingleSelectValue {\n                  name\n                  optionId\n                  field {\n                    ... on ProjectV2FieldCommon {\n                      id\n                      name\n                    }\n                  }\n                }\n              }\n            }\n            content {\n              ... on Issue {\n                id\n                title\n                number\n                body\n                state\n                url\n                createdAt\n                updatedAt\n                author {\n                  login\n                  avatarUrl\n                  url\n                }\n                repository {\n                  id\n                  name\n                  owner {\n                    login\n                  }\n                }\n                labels(first: 10) {\n                  nodes {\n                    id\n                    name\n                    color\n                    description\n                  }\n                }\n                assignees(first: 5) {\n                  nodes {\n                    id\n                    login\n                    avatarUrl\n                  }\n                }\n              }\n            }\n          }\n        }\n        repositories(first: 20) {\n          nodes {\n            id\n            name\n            nameWithOwner\n            url\n            owner {\n              login\n              avatarUrl\n            }\n          }\n        }\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n  url\n}"
): (typeof documents)["fragment CollaboratorFields on User {\n  id\n  login\n  avatarUrl\n  name\n  url\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation AddRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}"
): (typeof documents)["mutation AddRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      description\n      url\n      createdAt\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n}"
): (typeof documents)["mutation CreateRepository($input: CreateRepositoryInput!) {\n  createRepository(input: $input) {\n    repository {\n      id\n      name\n      description\n      url\n      createdAt\n      owner {\n        login\n        avatarUrl\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation DisableRepository($repositoryId: ID!) {\n  updateRepository(\n    input: {repositoryId: $repositoryId, hasIssuesEnabled: false, hasProjectsEnabled: false, hasWikiEnabled: false}\n  ) {\n    repository {\n      id\n      name\n    }\n  }\n}"
): (typeof documents)["mutation DisableRepository($repositoryId: ID!) {\n  updateRepository(\n    input: {repositoryId: $repositoryId, hasIssuesEnabled: false, hasProjectsEnabled: false, hasWikiEnabled: false}\n  ) {\n    repository {\n      id\n      name\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "mutation RemoveRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}"
): (typeof documents)["mutation RemoveRepositoryCollaborator($repositoryId: ID!, $title: String!, $body: String!) {\n  createIssue(input: {repositoryId: $repositoryId, title: $title, body: $body}) {\n    issue {\n      id\n      title\n      body\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query CheckRepositoryCollaborator($owner: String!, $name: String!, $username: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 1, query: $username) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}"
): (typeof documents)["query CheckRepositoryCollaborator($owner: String!, $name: String!, $username: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 1, query: $username) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}"
): (typeof documents)["query GetRepositoryCollaborators($owner: String!, $name: String!) {\n  repository(owner: $owner, name: $name) {\n    id\n    collaborators(first: 100) {\n      nodes {\n        ...CollaboratorFields\n      }\n    }\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetUserProfile {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n  }\n}"
): (typeof documents)["query GetUserProfile {\n  viewer {\n    id\n    login\n    name\n    avatarUrl\n    bio\n    location\n    company\n    email\n    websiteUrl\n    twitterUsername\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(
  source: "query GetViewer {\n  viewer {\n    id\n    login\n  }\n}"
): (typeof documents)["query GetViewer {\n  viewer {\n    id\n    login\n  }\n}"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
