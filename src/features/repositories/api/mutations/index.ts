import { gql } from "@apollo/client";

/**
 * Create Repository mutation
 */
export const CreateRepositoryDocument = gql`
  mutation CreateRepository($input: CreateRepositoryInput!) {
    createRepository(input: $input) {
      repository {
        id
        name
        description
        url
        createdAt
        owner {
          login
          avatarUrl
        }
      }
    }
  }
`;

/**
 * Disable Repository mutation (mock for demo)
 */
export const DisableRepositoryDocument = gql`
  mutation DisableRepository($repositoryId: ID!) {
    disableRepository(repositoryId: $repositoryId) {
      success
    }
  }
`;

/**
 * Add Repository Collaborator mutation (mock for demo)
 */
export const AddRepositoryCollaboratorDocument = gql`
  mutation AddRepositoryCollaborator($repositoryId: ID!, $username: String!, $permission: String!) {
    addCollaborator(
      input: { repositoryId: $repositoryId, username: $username, permission: $permission }
    ) {
      success
    }
  }
`;

/**
 * Remove Repository Collaborator mutation (mock for demo)
 */
export const RemoveRepositoryCollaboratorDocument = gql`
  mutation RemoveRepositoryCollaborator($repositoryId: ID!, $username: String!) {
    removeCollaborator(input: { repositoryId: $repositoryId, username: $username }) {
      success
    }
  }
`;
